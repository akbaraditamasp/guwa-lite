import { JobContract } from '@ioc:Rocketseat/Bull'
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
    const {
      data: { message, whatsapp_number },
    } = job

    const registered = await Whatsapp.client
      .isRegisteredUser(`${whatsapp_number}@c.us`)
      .then((val) => val)
      .catch(() => false)

    if (registered) {
      const result = await Limiter.limiter.schedule(() =>
        Whatsapp.client
          .sendMessage(`${whatsapp_number}@c.us`, message)
          .then((msg) => msg)
          .catch((e) => e)
      )

      return result
    } else {
      return 'error not registered'
    }
  }
}
