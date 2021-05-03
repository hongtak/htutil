import redis from 'redis'
import { promisify } from 'util'

function myP (p, key) {
  if (p[key] instanceof Function) {
    p[`${key}Async`] = promisify(p[key])
  }
}

const commands = ['srandmember', 'incr', 'hmset', 'srem', 'smembers', 'hgetall', 'hget', 'hset', 'sadd',
  'del', 'keys', 'set', 'sismember', 'hincrby', 'hmget', 'hdel', 'brpop', 'get', 'ttl', 'lpush']
commands.forEach(cmd => {
  myP(redis.RedisClient.prototype, cmd)
})

class RedisLib {
  config (config, callback) {
    this.callback = callback
    config.retry_strategy = (options) => {
      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error('Retry time exhasted')
      }
      // console.log(`attempt: ${options.attempt}`)
      return Math.min(options.attempt * 1000, 30 * 1000)
    }
    this.config = config
    this.client = redis.createClient(config)

    this.client.on('ready', () => {
      if (this.callback) {
        this.callback('info', `Reids --> ready: (${redisManager.client.server_info.redis_version})`)
      }
      this.connected = true
    })

    this.client.on('reconnecting', (obj) => {
      if (this.callback) {
        this.callback('warn', `Redis --> reconnecting: ${obj.delay} ${obj.total_retry_time} ${obj.attempt} ${obj.times_connected}`)
      }
      // console.log(`--> reconnected: ${obj.delay} ${obj.total_retry_time} ${obj.attempt} ${obj.times_connected}`)
      this.connected = false
    })

    this.client.on('end', () => {
      if (this.callback) {
        this.callback('info', 'Redis --> end')
      }
      this.connected = false
    })

    this.client.on('error', (err) => {
      if (this.callback) {
        this.callback('error', `Redis --> error: ${err}`)
      }
      this.connected = false
    })

    this.client.on('connect', () => {
      if (this.callback) {
        this.callback('info', 'Redis --> connect')
      }
    })

    this.client.on('warning', () => {
      if (this.callback) {
        this.callback('warn', 'Redis --> warning')
      }
    })
  }
}

export const redisManager = new RedisLib()
