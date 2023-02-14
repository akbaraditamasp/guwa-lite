import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import crypto from 'crypto'
import { Socket } from 'socket.io'

export default class SocketAuth {
  protected static urlDecode(encoded) {
    return Buffer.from(encoded, 'base64').toString('utf-8')
  }

  protected static generateHash(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  protected static parseToken(token) {
    const parts = token.split('.')
    /**
     * Ensure the token has two parts
     */
    if (parts.length !== 2) {
      throw new Error('E_INVALID_API_TOKEN')
    }

    /**
     * Ensure the first part is a base64 encode id
     */
    const tokenId = this.urlDecode(parts[0])

    if (!tokenId) {
      throw new Error('E_INVALID_API_TOKEN')
    }

    const parsedToken = this.generateHash(parts[1])
    return {
      token: parsedToken,
      tokenId,
    }
  }

  protected static async checkToken(token: string): Promise<User> {
    const parsedToken = this.parseToken(token)
    const apiToken = await Database.query()
      .from('api_tokens')
      .select('user_id')
      .where('id', parsedToken.tokenId)
      .andWhere('token', parsedToken.token)
      .first()

    const user = await User.find(apiToken.user_id)
    if (!apiToken) {
      throw new Error('E_INVALID_API_TOKEN')
    }
    return user!
  }

  private static async authenticate(socket: Socket): Promise<User> {
    const token = socket.handshake?.auth?.token

    if (!token || typeof token !== 'string') {
      throw new Error('Token not found')
    }

    try {
      return await this.checkToken(token)
    } catch (error) {
      throw new Error('Credentials is not valid')
    }
  }

  public async connection(socket: Socket, next): Promise<void> {
    try {
      await SocketAuth.authenticate(socket)
    } catch (error) {
      // handle errors
      next(new Error(error))
    }

    next()
  }
}
