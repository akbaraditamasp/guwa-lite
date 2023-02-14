import AdonisServer from '@ioc:Adonis/Core/Server'
import SocketAuth from 'App/Middleware/SocketAuth'
import User from 'App/Models/User'
import { Server } from 'socket.io'

class WebSocket {
  public io: Server
  private booted = false
  public user: User | null = null

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    this.io.use(new SocketAuth().connection)
  }
}

export default new WebSocket()
