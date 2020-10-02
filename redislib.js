const redis = require('redis')
const config = require('../config.json')
const loggerlib = require('./loggerlib')
const { promisify } = require('util')
// const { loggerlib } = require('htutil')

const logger = loggerlib.createLogger(config.logger, 'redis')

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
        logger.info(`RedisLib -> Attempt: ${options.attempt}`)
        return Math.min(options.attempt * 1000, 30 * 1000)
      }
    })
    this._client.on('connect', () => {
      logger.info('Connected')
    })

    this._client.on('ready', () => {
      logger.info(`Ready (${this._client.server_info.redis_version})`)
    })

    this._client.on('reconnecting', () => {
      logger.info('Reconnecting')
    })

    this._client.on('error', (err) => {
      logger.error('Error: ' + err.message)
    })

    this._client.on('end', () => {
      logger.info('Disconnected')
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
