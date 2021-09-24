import pkg from 'winston'

const { createLogger, format, transports } = pkg
const { combine, timestamp, json, printf, colorize } = format

const data = {}

const myFormat = printf(({ level, message, timestamp, service, ...meta }) => {
  let output = `${timestamp} `
  if (service) { output += `[${service}] ` }
  if (typeof message === 'object') { message = JSON.stringify(message, null) }
  output += `${level} - ${message}`
  if (Object.keys(meta).length > 0) { output += ` => ${JSON.stringify(meta)}` }
  return output
})

function create (options, service) {
  const logger = createLogger({
    defaultMeta: { service: service }
  })

  if (options.console) {
    const consoleTransport = new transports.Console({
      level: options.console,
      format: combine(colorize(), timestamp(), myFormat)
    })
    logger.add(consoleTransport)
  }

  if (options.http) {
    const httpTransport = new transports.Http(
      {
        host: options.http.host,
        port: options.http.port,
        path: options.http.path,
        level: options.http.level,
        format: combine(timestamp(), json())
      }
    )
    logger.add(httpTransport)
  }
  data.logger = logger
  return logger
}

function logger () {
  return data.logger
}

export default {
  create,
  logger
}
