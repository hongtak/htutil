import { MongoClient } from 'mongodb'

const connection = {}

async function create (opt) {
  const config = opt.mongodb
  const logger = opt.logger
  const uri = `mongodb://${config.username}:${config.password}@${config.server}/${config.db}`
  const client = new MongoClient(uri)
  eventListeners(client, logger)
  connection.client = await client.connect()
  connection.db = client.db(config.db)
  const version = await serverVersion()
  logger({ level: 'info', message: `[mongo]: server version ${version}` })
  return client
}

async function serverVersion () {
  const info = await connection.db.admin().serverInfo()
  return info.version
}

function client () {
  return connection.client
}

function db () {
  return connection.db
}

async function close () {
  await connection.client.close()
  connection.client = null
  connection.db = null
}

function eventListeners (client, logger) {
  const eventName = 'serverDescriptionChanged'
  client.on(eventName, event => {
    const previousType = event.previousDescription.type
    const newType = event.newDescription.type
    logger({ level: 'info', message: `[mongo]: ${previousType} => ${newType}` })
    connection.type = newType
  })
}

export default {
  create,
  serverVersion,
  client,
  db,
  close
}
