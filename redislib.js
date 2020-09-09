const redis = require('redis')
// const config = require('../config.json')
const logger = require('./logger')
const { promisify } = require('util')

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
  config (config) {
    this._config = config
  }

  connect () {
    if (this._client) {
      this._client.quit()
    }
    this._client = redis.createClient(`redis://${this._config.server}`)
    this._client.on('connect', () => {
      logger.info('RedisLib -> Redis connected')
    })

    this._client.on('ready', () => {
      logger.info(`RedisLib -> Redis ready (${this._client.server_info.redis_version})`)
    })

    this._client.on('reconnecting', () => {
      logger.info('RedisLib -> Redis reconnecting')
    })

    this._client.on('error', (err) => {
      logger.error('RedisLib -> Redis error: ' + err.message)
    })

    this._client.on('end', () => {
      logger.info('RedisLib -> Redis disconnected')
    })
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

module.exports = new RedisClient()
