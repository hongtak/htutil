const { MongoClient } = require('mongodb')

class MongoDb {
  config (config, callback) {
    this._config = config
    this.callback = callback
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
      if (this.callback) {
        this.callback('info', `Connected to MongoDB (${result.version})`)
      }
    } catch (err) {
      if (this.callback) {
        this.callback('error', `MongoDB Error: ${err.message}`)
      }
    }
  }

  async disconnect () {
    if (this._client) {
      this._client.close()
    }
    this._db = null
  }

  get client () {
    return this._client
  }

  get db () {
    return this._db
  }
}

module.exports = new MongoDb()
