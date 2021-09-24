// import htcrypto from './htcrypto.js'
// import uuidv4 from './uuid.js'
export { createLogger } from './logger.js'
export { mongo } from './mongolib.js'
export { redisManager } from './redislib.js'
export * as htcrypto from './htcrypto.js'

// V2 library
export * as loggerlib from './v2/loggerlib.js'
export * as mongolib from './v2/mongolib.js'
export * as redislib from './v2/redislib.js'

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
