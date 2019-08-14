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
  static connect (config) {
    if (RedisClient._client) {
      RedisClient._client.quit()
    }
    RedisClient._client = redis.createClient(`redis://${config.server}`)
    RedisClient._client.on('connect', () => {
      logger.info('RedisLib> Redis connected')
    })

    RedisClient._client.on('ready', () => {
      logger.info(`RedisLib> Redis ready (${RedisClient._client.server_info.redis_version})`)
    })

    RedisClient._client.on('reconnecting', () => {
      logger.info('RedisLib> Redis reconnecting')
    })

    RedisClient._client.on('error', (err) => {
      logger.error('RedisLib> Redis error: ' + err)
    })

    RedisClient._client.on('end', () => {
      logger.info('RedisLib> Redis disconnected')
    })
    return RedisClient._client
  }

  static sharedClient () {
    return RedisClient._client
  }
}

module.exports = RedisClient
