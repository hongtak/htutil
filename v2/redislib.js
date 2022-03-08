import { createClient } from 'redis'

const connection = {}

async function create (config, logger) {
  const opt = config.redis
  if (!opt) {
    throw new Error('Missing redis in config file.')
  }
  connection.logger = logger ?? (log => console.log(`${log.level} - ${log.message}`))
  opt.socket.reconnectStrategy = (retries) => {
    return Math.min(retries * 1000, 30000)
  }
  connection.client = createClient(opt)
  instanceEventListeners()

  await connection.client.connect()
  const info = await serverInfo()
  connection.logger({ level: 'info', message: `[redis]: Connected to: ${opt.socket.host}, server version ${info.redis_version}` })
  return connection.client
}

async function serverInfo () {
  const info = await connection.client.info('server')
  return dataSplit(info)
}

function dataSplit (data) {
  const array = data.split('\r\n')
  const info = {}
  for (const a of array) {
    const row = a.split(':')
    if (row.length === 2) {
      info[row[0]] = row[1].trim()
    }
  }
  return info
}

function client () {
  return connection.client
}

async function close () {
  if (connection.client) {
    await connection.client.quit()
    connection.client = null
  }
}

function instanceEventListeners () {
  const logger = connection.logger
  const client = connection.client
  client.on('connect', () => logger({ level: 'info', message: '[redis]: Initiating...' }))
  client.on('ready', () => logger({ level: 'info', message: '[redis]: Connection initiated.' }))
  client.on('error', (err) => logger({ level: 'error', message: `[redis] ${err.message}` }))
  client.on('reconnecting', () => logger({ level: 'warn', message: '[redis]: Reconnecting...' }))
  client.on('end', () => {
    logger({ level: 'warn', message: '[redis]: Connection closed.' })
    connection.client = null
  })
}

export default {
  create,
  serverInfo,
  client,
  close
}
