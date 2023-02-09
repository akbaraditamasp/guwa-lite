// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Whatsapp from 'App/Services/Whatsapp'

export default class WhatsappsController {
  public async qr() {
    return { qr: Whatsapp.qr }
  }
}
