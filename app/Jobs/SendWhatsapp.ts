import Application from '@ioc:Adonis/Core/Application'
import { JobContract } from '@ioc:Rocketseat/Bull'
import Message from 'App/Models/Message'
import Limiter from 'App/Services/Limiter'
import Whatsapp from 'App/Services/Whatsapp'
import { MessageMedia } from 'whatsapp-web.js'

/*
|--------------------------------------------------------------------------
| Job setup
|--------------------------------------------------------------------------
|
| This is the basic setup for creating a job, but you can override
| some settings.
|
| You can get more details by looking at the bullmq documentation.
| https://docs.bullmq.io/
*/

export default class SendWhatsapp implements JobContract {
  public key = 'SendWhatsapp'

  public async handle(job) {
    const message = job.data

    await Whatsapp.client.isRegisteredUser(`${message.recipients}@c.us`)

    let result
    if (message.media) {
      const media = await MessageMedia.fromFilePath(
        Application.tmpPath('uploads', message.media.name)
      )
      result = await Limiter.limiter.schedule(() =>
        Whatsapp.client
          .sendMessage(`${message.recipients}@c.us`, media, {
            caption: message.text || undefined,
          })
          .then((msg) => msg)
          .catch((e) => e)
      )
    } else {
      result = await Limiter.limiter.schedule(() =>
        Whatsapp.client
          .sendMessage(`${message.recipients}@c.us`, message.text || '-')
          .then((msg) => msg)
          .catch((e) => e)
      )
    }

    return result
  }

  public async onCompleted(job) {
    const message = job.data
    const messageModel = await Message.find(message.id)

    if (messageModel) {
      messageModel.status = 'DELIVERED'
      await messageModel.save()
    }
  }

  public async onFailed(job) {
    const message = job.data
    const messageModel = await Message.find(message.id)

    if (messageModel) {
      messageModel.status = 'FAILED'
      await messageModel.save()
    }
  }
}
