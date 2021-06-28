import { mongo, redisManager } from './htutil.js'

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

mongo.config(config.mongodb)
mongo.onChange(event => {
  let msg = `serverDescriptionChanged: [${event.previousDescription.type}] -> [${event.newDescription.type}]`
  if (event.newDescription.error) {
    msg = msg + `, error: ${event.newDescription.error.name}`
  }
  console.log(msg)
})
mongo.connect()

redisManager.config(config.redis, (level, msg) => {
  console.log({ level: level, message: `[#${process.pid}] ${msg}` })
})

