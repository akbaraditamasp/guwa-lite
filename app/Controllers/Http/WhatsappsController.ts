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
        recipients: schema.array().members(schema.string()),
        media: schema.file.optional({
          size: '16mb',
        }),
      }),
    })

    const messages: Array<Message> = []

    let mediaAttach

    if (media) {
      mediaAttach = Attachment.fromFile(media)
    }

    for (let recipient of recipients) {
      const message = new Message()
      message.recipients = recipient
      message.text = text || '-'
      if (media) {
        message.media = mediaAttach
        message.text = text || null
      }
      message.status = 'QUEUEING'

      messages.push(message)
    }

    await Message.createMany(messages)

    return messages.map((val) => {
      Bull.add(new SendWhatsapp().key, val.serialize())

      return val.serialize()
    })
  }
}
