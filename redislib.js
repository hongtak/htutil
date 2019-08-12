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
  constructor (config) {
    this.config = config
  }

  async connect () {
    const client = redis.createClient(`redis://${this.config.server}`)
    this.client = client

    return new Promise((resolve, reject) => {
      // client.on('connect', () => {
      //   logger.info('RedisLib> Redis connected')
      // })

      client.on('ready', () => {
        // logger.info('RedisLib> Redis ready')
        resolve()
      })

      client.on('reconnecting', () => {
        logger.info('RedisLib> Redis reconnecting')
      })

      client.on('error', (err) => {
        logger.error('RedisLib> Redis error: ' + err)
        reject(err)
      })

      client.on('end', () => {
        logger.info('RedisLib> Redis disconnected')
      })
    })
  }

  quit () {
    this.client.quit()
  }
}

module.exports = RedisClient
