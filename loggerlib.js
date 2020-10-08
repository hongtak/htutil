const winston = require('winston')
const { format, transports } = winston
const { combine, timestamp, colorize, printf } = format
const path = require('path')

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
  const consoleTransport = new transports.Console({
    format: combine(
      colorize(),
      consoleFormat
    )
  })

  var opt = {
    level: 'info',
    format: combine(
      timestamp()
    )
  }
  opt.defaultMeta = { service: service }
  if (config.level) {
    opt.level = config.level
  }

  const logger = winston.createLogger(opt)
  if (!config.production) {
    logger.add(consoleTransport)
  }
  if (config.combined) {
    const file = path.join(config.log_path, config.combined)
    const combinedTransport = new transports.File({ filename: file, format: consoleFormat })
    logger.add(combinedTransport)
  }
  if (config.error) {
    const file = path.join(config.log_path, config.error)
    const errorTransport = new transports.File({ filename: file, level: 'warn', format: consoleFormat })
    logger.add(errorTransport)
  }
  if (config.standalone) {
    const file = path.join(config.log_path, `${service}.log`)
    const standaloneTransport = new transports.File({ filename: file, format: consoleFormat })
    logger.add(standaloneTransport)
  }
  return logger
}

module.exports = {
  createLogger
}
