import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import Database from '@ioc:Adonis/Lucid/Database'

export default class SettingsController {
  public async apiKeyList({ request, auth }: HttpContextContract) {
    const { page, limit } = await request.validate({
      schema: schema.create({
        page: schema.number.optional(),
        limit: schema.number.optional([rules.range(5, 100)]),
      }),
    })

    return {
      pageCount: Math.ceil(
        (await User.query().whereNot('id', auth.use('api').user!.id).count('* as total'))[0].$extras
          .total / (limit || 5)
      ),
      page,
      data: (
        await User.query()
          .whereNot('id', auth.use('api').user!.id)
          .offset((page || 0) * (limit || 5))
          .limit(limit || 5)
          .orderBy('created_at', 'desc')
      ).map((user) => user.serialize()),
    }
  }

  public async addApiKey({ request, auth, response }: HttpContextContract) {
    const { username, password } = await request.validate({
      schema: schema.create({
        username: schema.string(),
        password: schema.string(),
      }),
    })

    if (!(await Hash.verify(auth.use('api').user!.password, password))) {
      return response.unauthorized()
    }

    const user = new User()
    user.username = username
    user.password = cuid()
    await user.save()

    return await auth.use('api').generate(user)
  }

  public async deleteApiKey({ request, auth, params, response }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    const { password } = await request.validate({
      schema: schema.create({
        password: schema.string(),
      }),
    })

    if (!(await Hash.verify(auth.use('api').user!.password, password))) {
      return response.unauthorized()
    }

    await user.delete()

    return user.serialize()
  }

  public async getApiKey({ request, response, auth, params }: HttpContextContract) {
    const { password } = await request.validate({
      schema: schema.create({
        password: schema.string(),
      }),
    })

    if (!(await Hash.verify(auth.use('api').user!.password, password))) {
      return response.unauthorized()
    }

    const user = await User.findOrFail(params.id)

    return await Database.transaction(async (trx) => {
      await Database.query()
        .useTransaction(trx)
        .from('api_tokens')
        .where('user_id', user.id)
        .delete()

      return await auth.use('api').generate(user)
    })
  }

  public async changePassword({ request, auth, response }: HttpContextContract) {
    const { newPassword, oldPassword } = await request.validate({
      schema: schema.create({
        newPassword: schema.string(),
        oldPassword: schema.string(),
      }),
    })

    if (!(await Hash.verify(auth.use('api').user!.password, oldPassword))) {
      return response.unauthorized()
    }

    auth.use('api').user!.password = newPassword
    await auth.use('api').user!.save()

    return auth.use('api').user!.serialize()
  }
}
