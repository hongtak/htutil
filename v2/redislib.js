import { createClient } from 'redis'

const connection = {}

async function create (opt, logger) {
  opt.socket.reconnectStrategy = (retries) => {
    return Math.min(retries * 1000, 30000)
  }

  const client = createClient(opt)
  instanceEventListeners(client, logger)
  await client.connect()
  connection.client = client
  const info = await serverInfo()
  if (logger) {
    logger({ level: 'info', message: `[redis]: Connected to: ${opt.socket.host}, server version ${info.redis_version}` })
  }
  return client
}

async function serverInfo () {
  const info = await connection.client.info('server')
  const array = info.split('\r\n')
  const serverInfo = {}
  for (const a of array) {
    const row = a.split(':')
    if (row.length === 2) {
      serverInfo[row[0]] = row[1].trim()
    }
  }
  return serverInfo
}

async function serverVersion () {
  const info = await serverInfo()
  return info.redis_version
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

function instanceEventListeners (client, logger) {
  if (!logger) { return }
  client.on('connect', () => {
    logger({ level: 'info', message: '[redis]: connect' })
  })
  client.on('ready', () => {
    logger({ level: 'info', message: '[redis]: ready' })
  })
  client.on('error', (err) => {
    logger({ level: 'error', message: `[redis] ${err.message}` })
  })
  client.on('reconnecting', () => {
    logger({ level: 'warn', message: '[redis]: reconnecting' })
  })
  client.on('end', () => {
    logger({ level: 'warn', message: '[redis]: end' })
    connection.client = null
  })
  client.on('warning', () => {
    logger({ level: 'warn', message: '[redis]: warning' })
  })
}

export default {
  create,
  serverVersion,
  client,
  close
}
