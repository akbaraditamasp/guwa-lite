import Bottleneck from 'bottleneck'

class Limiter {
  public limiter: Bottleneck
  private booted = false

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 30000,
    })
  }
}

export default new Limiter()
