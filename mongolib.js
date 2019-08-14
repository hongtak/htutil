const { MongoClient } = require('mongodb')
const logger = require('./logger')

class MongoDb {
  static url (config) {
    let url = ''
    if (config.username) {
      url = `${config.username}:${config.password}@`
    }
    return `mongodb://${url}${config.server}/${config.db}?authMechanism=${config.authMechanism}`
  }

  static async connect (config) {
    MongoDb._client = new MongoClient(MongoDb.url(config), { useNewUrlParser: true, useUnifiedTopology: true })
    await MongoDb._client.connect()
    MongoDb._db = MongoDb._client.db(config.db)

    const result = await MongoDb.sharedDb().admin().serverInfo()
    logger.info(`MongoLib> Connected to MongoDB (${result.version}): ${config.db}`)
    return MongoDb._db
  }

  static sharedClient () {
    return MongoDb._client
  }

  static sharedDb () {
    return MongoDb._db
  }
}

module.exports = MongoDb
