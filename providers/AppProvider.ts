import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    // App is ready
    if (this.app.environment === 'web') {
      await import('../start/socket')
      await import('../start/whatsapp')
      await import('../start/limit')
    }
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
