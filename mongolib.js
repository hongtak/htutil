const { MongoClient } = require('mongodb')
const logger = require('./logger')

class MongoDb {
  constructor (config) {
    this._config = config
    let login = ''
    if (config.username) {
      const username = encodeURIComponent(config.username)
      const password = encodeURIComponent(config.password)
      login = `${username}:${password}@`
    }
    const url = config.server
    const db = config.db

    const uri = `mongodb://${login}${url}/${db}`
    this._client = new MongoClient(uri, { useUnifiedTopology: true })
  }

  async connect () {
    try {
      await this._client.connect()
      this._db = this._client.db(this._config.db)
      const result = await this._db.admin().serverInfo()
      logger.info(`MongoLib -> Connected to MongoDB (${result.version})`)
    } catch (err) {
      console.log(err)
    }
  }

  async disconnect () {
    this._client.close()
    this._client = null
    this._db = null
  }

  get client () {
    return this._client
  }

  get db () {
    return this._db
  }
}

module.exports = MongoDb
