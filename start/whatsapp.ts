import Whatsapp from 'App/Services/Whatsapp'
import WebSocket from 'App/Services/WebSocket'
import Hook from 'App/Models/Hook'
import axios from 'axios'
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  MessageRetryMap,
  useMultiFileAuthState,
} from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import Wa from 'App/Services/Whatsapp'
import { Browsers } from '@adiwajshing/baileys/lib/Utils'

Whatsapp.boot()
const msgRetryCounterMap: MessageRetryMap = {}

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    msgRetryCounterMap,
    generateHighQualityLinkPreview: true,
    browser: Browsers.macOS('GUWA Lite'),
  })

  sock.ev.process(async (events) => {
    if (events['connection.update']) {
      const update = events['connection.update']
      const { connection, lastDisconnect } = update
      if (connection === 'close') {
        if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
          startSock()
        } else {
          Whatsapp.qr = null
          WebSocket.io.emit('qr', { qr: null })
        }
      }

      if (update.qr) {
        Whatsapp.qr = update.qr
        WebSocket.io.emit('qr', { qr: update.qr })
      } else {
        Whatsapp.qr = 'success'
      }
    }
    if (events['open']) {
      Whatsapp.qr = 'success'
      WebSocket.io.emit('qr', { qr: 'success' })
    }
    if (events['messages.upsert']) {
      const chat = events['messages.upsert']
      for (let c of chat.messages) {
        if (!c.key.fromMe && c.key.remoteJid !== 'status@broadcast') {
          const hooks = await Hook.all()
          for (const hook of hooks) {
            axios
              .post(hook.endpoint, {
                msg: c,
              })
              .then(() => {})
              .catch(() => {})
          }
        }
      }
    }

    if (events['creds.update']) {
      await saveCreds()
    }
  })

  Wa.client = sock
  return sock
}

startSock()
