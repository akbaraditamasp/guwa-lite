import Application from '@ioc:Adonis/Core/Application'
import { JobContract } from '@ioc:Rocketseat/Bull'
import Message from 'App/Models/Message'
import Limiter from 'App/Services/Limiter'
import Whatsapp from 'App/Services/Whatsapp'

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

    const id = `${message.recipients}@s.whatsapp.net`

    let result
    if (message.media) {
      result = await Limiter.limiter.schedule(() =>
        Whatsapp.client.sendMessage(id, {
          image: Application.tmpPath('uploads', message.media.name),
          caption: `${message.text}`,
        })
      )
    } else {
      result = await Limiter.limiter.schedule(() =>
        Whatsapp.client.sendMessage(id, { text: `${message.text}` })
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
