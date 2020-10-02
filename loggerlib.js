const winston = require('winston')
const { format, transports } = winston
const { combine, timestamp, colorize, printf, json } = format

const consoleFormat = printf(({ level, message, service, timestamp, ...meta }) => {
  if (typeof message === 'object') {
    message = '\n' + JSON.stringify(message, null, 2)
  }
  const metaKeys = Object.keys(meta)
  if (metaKeys.length > 0) {
    message += '\n' + JSON.stringify(meta, null, 2)
  }
  if (service) {
    return `${timestamp} [${service}] ${level} - ${message}`
  } else {
    return `${timestamp} ${level} - ${message}`
  }
})

const createLogger = (config, service) => {
  const consoleTransport = new transports.Console({ format: combine(
    colorize(),
    consoleFormat
  )})

  const combinedTransport = new transports.File({ filename: config.combined, format: json() })
  const errorTransport = new transports.File({ filename: config.error, level: 'warn', format: consoleFormat })

  var opt = {
    level: 'info',
    format: combine(
      timestamp()
    ),
    transports: [combinedTransport, errorTransport]
  }
  opt.defaultMeta = { service: service }
  if (config.level) {
    opt.level = config.level
  }

  const logger = winston.createLogger(opt)
  if (!config.production) {
    logger.add(consoleTransport)
  }
  return logger
}

module.exports = {
  createLogger
}
