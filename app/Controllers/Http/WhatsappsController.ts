import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Bull from '@ioc:Rocketseat/Bull'
import SendWhatsapp from 'App/Jobs/SendWhatsapp'
import Hook from 'App/Models/Hook'
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

  public async hook() {
    return (await Hook.query()).map((val) => val.serialize())
  }

  public async setHook({ request }: HttpContextContract) {
    const { hooks } = await request.validate({
      schema: schema.create({
        hooks: schema.array().members(
          schema.object().members({
            id: schema.number.optional(),
            endpoint: schema.string(),
          })
        ),
      }),
    })

    const deleted = await Hook.query()
    const added: Array<Hook> = []
    const updated: Array<Hook> = []

    for (let hook of hooks) {
      if (hook.id) {
        const index = deleted.findIndex((val) => val.id === hook.id)
        if (index >= 0) {
          deleted[index].endpoint = hook.endpoint
          updated.push(deleted[index])
          deleted.splice(index, 1)
        }
      } else {
        const hookModel = new Hook()
        hookModel.endpoint = hook.endpoint
        added.push(hookModel)
      }
    }

    return await Database.transaction(async (trx) => {
      if (deleted.length) {
        await Hook.query({ client: trx })
          .whereIn(
            'id',
            deleted.map((val) => val.id)
          )
          .delete()
      }
      if (updated.length) {
        for (const update of updated) {
          await update.useTransaction(trx).save()
        }
      }
      if (added.length) {
        await Hook.createMany(added, {
          client: trx,
        })
      }

      return [...updated, ...added].map((val) => val.serialize())
    })
  }
}
