import redis from 'redis'

const connection = {}

async function create (opt) {
  opt.redis.socket.reconnectStrategy = (retries) => {
    return Math.min(retries * 1000, 30000)
  }

  const client = redis.createClient(opt.redis)
  instanceEventListeners(client, opt.logger)
  await client.connect()
  connection.client = client
  const info = await serverInfo()
  if (opt.logger) {
    opt.logger({ level: 'info', message: `[redis]: server version ${info.redis_version}` })
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

function client () {
  return connection.client
}

async function close () {
  await connection.client.quit()
  connection.client = null
}

function instanceEventListeners (client, logger) {
  if (!logger) { return }
  client.on('error', (err) => {
    const msg = { level: 'error', message: `[redis]: ${err.message}` }
    if (logger) { logger(msg) }
  })
  client.on('connect', () => {
    const msg = { level: 'info', message: '[redis]: connect' }
    if (logger) { logger(msg) }
  })
  client.on('ready', () => {
    const msg = { level: 'info', message: '[redis]: ready' }
    if (logger) { logger(msg) }
  })
  client.on('reconnecting', () => {
    const msg = { level: 'info', message: '[redis]: reconnecting' }
    if (logger) { logger(msg) }
  })
  client.on('end', () => {
    const msg = { level: 'info', message: '[redis]: end' }
    if (logger) { logger(msg) }
    connection.client = null
  })
  client.on('warning', () => {
    const msg = { level: 'warn', message: '[redis]: warning' }
    if (logger) { logger(msg) }
  })
}

export default {
  create,
  serverInfo,
  client,
  close
}
