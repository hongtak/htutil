import redis from 'redis'
import util from 'util'
const { promisify } = util

function promisifyAll (p) {
  for (const key in p) {
    if (p[key] instanceof Function) {
      p[`${key}Async`] = promisify(p[key])
    }
  }
}

promisifyAll(redis.RedisClient.prototype)
promisifyAll(redis.Multi.prototype)

class RedisClient {
  config (config, callback) {
    this._config = config
    this.callback = callback
  }

  async connect () {
    if (this._client) {
      this._client.quit()
    }
    this._client = redis.createClient(`redis://${this._config.server}`, {
      retry_strategy: (options) => {
        // if (options.error && options.error.code === 'ECONNREFUSED') {
        //   return new Error('The server refused the connection')
        // }
        // Stop after 60 mins
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhasted')
        }
        // Stop after 100 attempt
        // if (options.attempt > 100) {
        //   return undefined
        // }
        this.callback('info', `Attempt: ${options.attempt}`)
        return Math.min(options.attempt * 1000, 30 * 1000)
      }
    })

    this._client.auth(this._config.password)

    const p = new Promise((resolve, reject) => {
      this._client.on('connect', async () => {
        if (this.callback) {
          this.callback('info', 'Redis connected')
        }
      })

      this._client.on('ready', async () => {
        if (this.callback) {
          this.callback('info', `Redis Ready (${this._client.server_info.redis_version})`)
          resolve()
        }
      })
    })

    this._client.on('reconnecting', () => {
      if (this.callback) {
        this.callback('warn', 'Redis reconnecting...')
      }
    })

    this._client.on('error', (err) => {
      if (this.callback) {
        this.callback('error', 'Redis error: ' + err.message)
      }
    })

    this._client.on('end', () => {
      if (this.callback) {
        this.callback('info', 'Redis disconnected')
      }
    })

    return p
  }

  get client () {
    return this._client
  }

  disconnect () {
    if (this._client) {
      this._client.quit()
      this._client = null
    }
  }
}

const redisClient = new RedisClient()
export { redisClient }
