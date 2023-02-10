import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Bull from '@ioc:Rocketseat/Bull'
import SendWhatsapp from 'App/Jobs/SendWhatsapp'
import Message from 'App/Models/Message'

import Whatsapp from 'App/Services/Whatsapp'

export default class WhatsappsController {
  public async qr() {
    return { qr: Whatsapp.qr }
  }

  public async send({ request }: HttpContextContract) {
    const { text, media, recipients } = await request.validate({
      schema: schema.create({
        text: schema.string.optional(),
        recipients: schema.string(),
        media: schema.file.optional({
          size: '16mb',
        }),
      }),
    })

    const message = new Message()
    message.recipients = recipients
    message.text = text || '-'
    if (media) {
      message.media = Attachment.fromFile(media)
      message.text = text || null
    }
    message.status = 'QUEUEING'
    await message.save()

    Bull.add(new SendWhatsapp().key, message.serialize())

    return message.serialize()
  }
}
