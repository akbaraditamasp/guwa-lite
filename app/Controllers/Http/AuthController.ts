import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
  public async login({ request, response, auth }: HttpContextContract) {
    const { username, password } = await request.validate({
      schema: schema.create({
        username: schema.string(),
        password: schema.string(),
      }),
    })

    const user = await User.query().where('username', username).firstOrFail()

    if (!(await Hash.verify(user.password, password))) return response.unauthorized()

    return {
      ...user.serialize(),
      token: await auth.use('api').generate(user),
    }
  }

  public async logout({ auth }: HttpContextContract) {
    const user = auth.use('api').user!

    auth.use('api').revoke()

    return user!.serialize()
  }
}
