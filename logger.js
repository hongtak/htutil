import winston from 'winston'
const { format, transports } = winston
const { combine, timestamp, colorize, printf } = format

const consoleFormat = printf(({ level, message, service, timestamp, ...meta }) => {
  if (typeof message === 'object') {
    message = JSON.stringify(message, null, 2)
  }
  if (service) {
    return `${timestamp} [${service}] ${level} - ${message}`
  } else {
    return `${timestamp} ${level} - ${message}`
  }
})

const createLogger = (config, service) => {
  const serviceConfig = config
  const opt = {
    format: combine(
      timestamp()
    ),
    defaultMeta: { service: service }
  }

  const logger = winston.createLogger(opt)

  const consoleTransport = new transports.Console({
    format: combine(
      colorize(),
      consoleFormat
    )
  })
  logger.add(consoleTransport)
  if (!serviceConfig) {
    logger.error('missing logger config')
    return logger
  }
  if (serviceConfig.console) {
    consoleTransport.level = serviceConfig.console.level
  } else {
    logger.error('config.console is undefined')
  }

  if (serviceConfig.file) {
    const fileTransport = new transports.File({
      level: serviceConfig.file.level,
      filename: serviceConfig.file.name,
      format: consoleFormat
    })
    logger.add(fileTransport)
  } else {
    logger.error('config.file is undefined')
  }
  // if (config.combined) {
  //   const file = path.join(config.log_path, config.combined)
  //   const combinedTransport = new transports.File({ filename: file, format: consoleFormat })
  //   logger.add(combinedTransport)
  // }
  // if (config.error) {
  //   const file = path.join(config.log_path, config.error)
  //   const errorTransport = new transports.File({ filename: file, level: 'warn', format: consoleFormat })
  //   logger.add(errorTransport)
  // }
  // if (config.standalone) {
  //   const file = path.join(config.log_path, `${service}.log`)
  //   const standaloneTransport = new transports.File({ filename: file, format: consoleFormat })
  //   logger.add(standaloneTransport)
  // }
  return logger
}

export { createLogger }
