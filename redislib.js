import redis from 'redis'
import { promisify } from 'util'

const commands = ['srandmember', 'incr', 'hmset', 'srem', 'smembers', 'hgetall', 'hget', 'hset', 'sadd',
  'del', 'keys', 'set', 'sismember', 'hincrby', 'hmget', 'hdel', 'brpop', 'get', 'ttl', 'lpush', 'type', 'scard']

class RedisLib {
  promisify (key) {
    const p = redis.RedisClient.prototype
    if (p[key] instanceof Function) {
      p[`${key}Async`] = promisify(p[key])
    } else {
      console.log(`RedisLib warning: ${key} not a valid function`)
    }
  }

  promisifyAll (keys) {
    keys.forEach(cmd => {
      this.promisify(cmd)
    })
  }

  constructor () {
    this.promisifyAll(commands)
  }

  config (config, callback) {
    this.callback = callback
    config.retry_strategy = (options) => {
      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error('Retry time exhasted')
      }

      // return options.total_retry_time < 600000 ? 5000 : 10000
      return Math.min((options.attempt + 5) * 1000, 30 * 1000)
    }
    this.config = config
    this.client = redis.createClient(config)

    this.client.on('ready', () => {
      if (this.callback) {
        this.callback('info', `Reids --> ready: (${redisManager.client.server_info.redis_version})`)
      }
      this.connected = true
    })

    this.client.on('connect', () => {
      if (this.callback) {
        this.callback('info', 'Redis --> connect')
      }
    })

    this.client.on('reconnecting', (obj) => {
      if (this.callback) {
        this.callback('warn', `Redis --> reconnecting attempt: #${obj.attempt}, total: ${obj.total_retry_time / 1000}s wait: ${obj.delay / 1000}s [${obj.times_connected}]`)
      }
      // console.log(`--> reconnected: ${obj.delay} ${obj.total_retry_time} ${obj.attempt} ${obj.times_connected}`)
    })

    this.client.on('error', (err) => {
      if (this.callback) {
        this.callback('error', `Redis --> error: ${err}`)
      }
    })

    this.client.on('end', () => {
      if (this.callback) {
        this.callback('info', 'Redis --> end')
      }
      this.connected = false
    })

    this.client.on('warning', () => {
      if (this.callback) {
        this.callback('warn', 'Redis --> warning')
      }
    })
  }
}

export const redisManager = new RedisLib()
