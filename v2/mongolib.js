import { MongoClient } from 'mongodb'

const connection = {
  logger: console.log
}

async function create (config, logger) {
  const mongoConfig = config.mongodb
  if (!mongoConfig) {
    throw new Error('Missing mongodb in config file.')
  }
  connection.logger = logger ?? (log => console.log(`${log.level} - ${log.message}`))
  const uri = `mongodb://${mongoConfig.username}:${mongoConfig.password}@${mongoConfig.server}/${mongoConfig.db}`
  connection.client = new MongoClient(uri)
  eventListeners()
  await connection.client.connect()
  const info = await serverInfo()
  connection.logger({ level: 'info', message: `[mongodb]: Connected to: ${mongoConfig.server}, server version ${info.version}` })
  return client
}

async function serverInfo () {
  return connection.client.db().admin().serverInfo()
}

function client () {
  return connection.client
}

function db () {
  return connection.client.db()
}

async function close () {
  await connection.client.close()
  connection.client = null
  connection.logger({ level: 'warn', message: '[mongodb]: Connection closed.' })
}

function eventListeners () {
  const eventName = 'serverDescriptionChanged'
  connection.client.on(eventName, event => {
    const previousType = event.previousDescription.type
    const newType = event.newDescription.type
    connection.logger({ level: 'info', message: `[mongodb]: Server description changed from ${previousType} => ${newType}` })
    connection.type = newType
  })
}

export default {
  create,
  // serverVersion,
  serverInfo,
  client,
  db,
  close
}
