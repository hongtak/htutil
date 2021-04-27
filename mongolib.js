import pkg from 'mongodb'

const { MongoClient } = pkg

class MongoLib {
  config (config) {
    this.config = config
    const uri = `mongodb://${config.username}:${config.password}@${config.server}/${config.db}`
    this.client = new MongoClient(uri, { useUnifiedTopology: true })
  }

  onChange (callback) {
    const eventName = 'serverDescriptionChanged'
    this.client.on(eventName, callback)
  }

  async connect () {
    await this.client.connect()
    this.db = this.client.db(this.config.db)
    return this.db.admin().serverInfo()
  }

  async disconnect () {
    if (this.client) {
      this.client.close()
    }
    this.db = null
  }
}

export const mongo = new MongoLib()
