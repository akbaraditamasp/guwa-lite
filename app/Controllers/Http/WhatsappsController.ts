import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Bull from '@ioc:Rocketseat/Bull'
import SendWhatsapp from 'App/Jobs/SendWhatsapp'

import Whatsapp from 'App/Services/Whatsapp'

export default class WhatsappsController {
  public async qr() {
    return { qr: Whatsapp.qr }
  }

  public async send({ request }: HttpContextContract) {
    const { message, whatsapp_number } = await request.validate({
      schema: schema.create({
        message: schema.string(),
        whatsapp_number: schema.number(),
      }),
    })

    Bull.add(new SendWhatsapp().key, { message, whatsapp_number })
    Bull.add(new SendWhatsapp().key, { message, whatsapp_number })
    Bull.add(new SendWhatsapp().key, { message, whatsapp_number })
    Bull.add(new SendWhatsapp().key, { message, whatsapp_number })
    Bull.add(new SendWhatsapp().key, { message, whatsapp_number })

    return 'success'
  }
}
