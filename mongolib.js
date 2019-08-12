const { MongoClient } = require('mongodb')

class MongoDb {
  constructor (config) {
    this.config = config
  }

  url () {
    let url = ''
    if (this.config.username) {
      url = `${this.config.username}:${this.config.password}@`
    }
    return `mongodb://${url}${this.config.server}/${this.config.db}?authMechanism=${this.config.authMechanism}`
  }

  async connect () {
    this.client = new MongoClient(this.url(), { useNewUrlParser: true })
    await this.client.connect()
    this.db = this.client.db(this.config.db)
  }
}

module.exports = MongoDb
