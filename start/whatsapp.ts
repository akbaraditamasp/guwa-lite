import Whatsapp from 'App/Services/Whatsapp'
import WebSocket from 'App/Services/WebSocket'
import Hook from 'App/Models/Hook'
import axios from 'axios'

Whatsapp.boot()

/**
 * Listen for incoming socket connections
 */

Whatsapp.client.on('qr', (qr) => {
  Whatsapp.qr = qr
  WebSocket.io.emit('qr', { qr })
})

Whatsapp.client.on('ready', () => {
  Whatsapp.qr = 'success'
  WebSocket.io.emit('qr', { qr: 'success' })
})

Whatsapp.client.on('disconnected', () => {
  Whatsapp.client.destroy()
  Whatsapp.client.initialize()

  Whatsapp.qr = null
  WebSocket.io.emit('qr', { qr: null })
})

Whatsapp.client.on('message', async (msg) => {
  const hooks = await Hook.all()
  for (const hook of hooks) {
    axios
      .post(hook.endpoint, {
        msg,
      })
      .then(() => {})
      .catch(() => {})
  }
})
