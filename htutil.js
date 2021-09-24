import loggerlib from './v2/loggerlib.js'
import mongolib from './v2/mongolib.js'
import redislib from './v2/redislib.js'

export { createLogger } from './logger.js'
export { mongo } from './mongolib.js'
// export { redisManager } from './redislib.js'
export * as htcrypto from './htcrypto.js'

// V2 library
export { loggerlib, mongolib, redislib }

// const MongoDb = require('./mongolib')
// const uuid = require('./uuid')
// const RedisClient = require('./redislib')
// const htcrypto = require('./htcrypto')
// const loggerlib = require('./loggerlib')
// module.exports = {
//   MongoDb,
//   uuid,
//   RedisClient,
//   htcrypto,
//   loggerlib
// }

// export {
//   createLogger,
//   mongo
// }
