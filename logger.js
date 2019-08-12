const winston = require('winston')
const { format, transports } = winston
const { combine, timestamp, colorize, printf, splat } = format
// const config = require('../config.json')
// const path = require('path')

// require('winston-daily-rotate-file')

// let dailyRotateFile = new transports.DailyRotateFile({
//   filename: path.join(config.log_path, 'calcium-%DATE%.log'),
//   datePattern: 'YYYYMM',
//   maxSize: '20m',
//   maxFiles: '14d',
//   format: json()
// })

// let dailyRotateErrorFile = new transports.DailyRotateFile({
//   filename: path.join(config.log_path, 'calcium-err-%DATE%.log'),
//   datePattern: 'YYYYMM',
//   maxSize: '20m',
//   maxFiles: '14d',
//   level: 'error',
//   format: json()
// })

// dailyRotateFile.on('rotate', (oldFilename, newFilename) => {
//   // do something fun here.
// })

const myFormat = printf(info => {
  let data = info.message
  if (typeof info.message === 'object') {
    data = JSON.stringify(info.message, null, 2)
  }
  if (info.meta) {
    data += ' ' + JSON.stringify(info.meta)
  }
  return `${info.timestamp} ${info.level} \t- ${data}`
})

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    splat()
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        myFormat
      )
    })
    // new transports.File({ filename: 'error.log', level: 'error', format: json() }),
    // new transports.File({ filename: 'combined.log', format: json() }),
    // dailyRotateErrorFile,
    // dailyRotateFile
  ]
})

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple()
//   }))
// }

module.exports = logger
