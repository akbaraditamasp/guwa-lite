class Whatsapp {
  public client
  private booted = false
  public qr: String | null = null

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
  }
}

export default new Whatsapp()
