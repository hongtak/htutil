import redislib from './v3/redislib.js'
import { setTimeout } from 'timers/promises'

const options = {
  redis: {
    url: 'redis://default:hungryrabbit112@10.0.20.171'
  }
}

await redislib.create(options)

const client = redislib.client()
while (true) {
  // while (!redislib.ready()) {
  //   console.log('waiting...')
  //   await setTimeout(1000)
  // }
  console.log('calling incr...')
  await client.incr('count')
  const value = await client.get('count')
  console.log(value)
  await setTimeout(1000)
}
