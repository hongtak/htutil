import { randomUUID } from 'crypto'
import { loggerlib, redislib, mongolib } from './htutil.js'
import { readFileSync } from 'fs'

// const config = JSON.parse(readFileSync(new URL('./config.json', import.meta.url)))
const config = JSON.parse(readFileSync('./config.json'))

const logger = loggerlib.create(config.logger, 'quicktest')
logger.info(`process.cwd(): ${process.cwd()}`)
logger.info(`import.meta.url: ${import.meta.url}`)
const uuid = randomUUID()
logger.info(uuid)

await redislib.create(config.redis, log => { logger.log(log) })
await mongolib.create(config.mongodb, log => { logger.log(log) })
await redislib.close()
await mongolib.close()
