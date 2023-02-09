import Whatsapp from 'App/Services/Whatsapp'
import WebSocket from 'App/Services/WebSocket'

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
