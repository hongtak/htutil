import { setInterval } from 'timers/promises'
import { redisManager } from './htutil.js'
import { randomInt } from 'crypto'
import { hrtime } from 'process'

const config = {
  redis: {
    host: '10.0.10.152',
    password: 'hungryrabbit112'
  },
  mongodb: {
    username: 'calcium',
    password: 'hungryrabbit112',
    authMechanism: 'DEFAULT',
    server: '10.0.10.152:27017',
    db: 'calciumdb'
  }
}

// redisManager.config(config.redis, (level, msg) => {
//   console.log({ level: level, message: `[#${process.pid}] ${msg}` })
// })

// await mainLoop().catch((err) => {
//   console.log(`mainLoop dead -> ${err}`)
// })

// async function mainLoop () {
//   for await (let a of setInterval(1000, 'hello')) {
//     if (redisManager.connected) {
//       const count = await redisManager.client.incrAsync('hellocount')
//       console.log(count)
//     }
//   }
// }

// redisManager.client.quit(() => {
//   console.log('redis.quit()')
// })

function randomCrash (next) {
  const t = randomInt(30, 200)
  if (t > 190) {
    next(Error('Timeout'))
  } else {
    setTimeout(() => {
      next(null, randomInt(0, 100))
    }, t)
  }
}

function randomCrash2 () {
  const promise = new Promise((resolve, reject) => {
    const t = randomInt(30, 200)
    if (t > 190) {
      reject(Error('Timeout'))
    } else {
      setTimeout(() => {
        resolve(t)
      }, t)
    }
  })
  return promise
}

// const start = process.hrtime.bigint()
// randomCrash((err, result) => {
//   if (err) {
//     const end = process.hrtime.bigint()
//     const diff = Number(end - start) / 1e6
//     console.log(`randomCrash error: ${err} [${diff}ms]`)
//     return
//   }
//   const end = process.hrtime.bigint()
//   const diff = Number(end - start) / 1e6
//   console.log(`result: ${result} [${diff}ms]`)
// })

main()
  .catch((err) => {
    console.error(`main error: ${err}`)
  })

async function main () {
  for await (const data of setInterval(1000, 'test')) {
    const result = await randomCrash2()
    console.log(`name: ${data} - ${result}`)
  }
}

// const startp = process.hrtime.bigint()
// randomCrash2()
//   .then((value) => {
//     const end = process.hrtime.bigint()
//     const diff = Number(end - startp) / 1e6
//     console.log(`promise version: ${value} [${diff}ms]`)
//     return value * 2
//   })
//   .then((value) => {
//     console.log(`new value: ${value}`)
//   })
//   .catch((err) => {
//     const end = process.hrtime.bigint()
//     const diff = Number(end - startp) / 1e6
//     console.log(`promise version error: ${err} [${diff}ms]`)
//   })
