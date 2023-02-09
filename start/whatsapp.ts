import Whatsapp from 'App/Services/Whatsapp'
Whatsapp.boot()

/**
 * Listen for incoming socket connections
 */

Whatsapp.client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr)
})

Whatsapp.client.on('ready', () => {
  console.log('Client is ready!')
})
