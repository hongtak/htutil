import { randomUUID } from 'crypto'
import loggerlib from './v2/loggerlib.js'
import redislib from './v2/redislib.js'
import mongolib from './v2/mongolib.js'
import { readFileSync } from 'fs'

// const config = JSON.parse(readFileSync(new URL('./config.json', import.meta.url)))
const config = JSON.parse(readFileSync('./config.json'))

const logger = loggerlib.create(config, 'quicktest')
// logger.info(`process.cwd(): ${process.cwd()}`)
// logger.info(`import.meta.url: ${import.meta.url}`)
const uuid = randomUUID()
logger.info(uuid)

// Test logger
logger.error('error: 0')
logger.warn('warn: 1')
logger.info('info: 2')
logger.http('http: 3')
logger.verbose('verbose: 4')
logger.debug('debug: 5')
logger.silly('silly: 6')

await redislib.create(config, log => { logger.log(log) })
// await redislib.create(config) // Use default logger

await mongolib.create(config, log => { logger.log(log) })
// await mongolib.create(config) // Use default logger
const db = mongolib.db()
const col = db.collection('logs')
const ecount = await col.estimatedDocumentCount()
const count = await col.countDocuments()
logger.info(`ecount: ${ecount}, count: ${count}`)

await redislib.close()
await mongolib.close()
