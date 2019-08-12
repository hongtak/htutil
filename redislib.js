const redis = require('redis')
const config = require('../config.json')
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

const client = redis.createClient(config.redis.server)

client.on('connect', () => {
  logger.info('Redis connected')
})

client.on('error', (err) => {
  logger.error('Redis error: ' + err)
})

client.on('end', () => {
  logger.info('Redis disconnected')
})

module.exports = client
