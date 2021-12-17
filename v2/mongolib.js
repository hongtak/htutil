import { MongoClient } from 'mongodb'

const connection = {}

async function create (config, logger) {
  const uri = `mongodb://${config.username}:${config.password}@${config.server}/${config.db}`
  const client = new MongoClient(uri)
  eventListeners(client, logger)
  connection.client = await client.connect()
  connection.db = client.db(config.db)
  connection.logger = logger
  const version = await serverVersion()
  logger({ level: 'info', message: `[mongodb]: Connected to: ${config.server}, server version ${version}` })
  return client
}

async function serverVersion () {
  const info = await connection.db.admin().serverInfo()
  return info.version
}

async function serverInfo () {
  return connection.db.admin().serverInfo()
}

function client () {
  return connection.client
}

function db () {
  return connection.db
}

async function close () {
  await connection.client.close()
  if (connection.logger) {
    connection.logger({ level: 'warn', message: '[mongodb]: Connection closed.' })
  }
  connection.client = null
  connection.db = null
}

function eventListeners (client, logger) {
  const eventName = 'serverDescriptionChanged'
  client.on(eventName, event => {
    const previousType = event.previousDescription.type
    const newType = event.newDescription.type
    logger({ level: 'info', message: `[mongodb]: Server description changed from ${previousType} => ${newType}` })
    connection.type = newType
  })
}

export default {
  create,
  serverVersion,
  serverInfo,
  client,
  db,
  close
}
