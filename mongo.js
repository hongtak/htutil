const MongoClient = require('mongodb').MongoClient
const config = require('../config.json')
const logger = require('./logger')

const username = config.mongodb.username
const password = config.mongodb.password
const authMechanism = config.mongodb.authMechanism
const mongodbServer = config.mongodb.server
const mongodbDb = config.mongodb.db

const url = `mongodb://${username}:${password}@${mongodbServer}/${mongodbDb}?authMechanism=${authMechanism}`
// const url = `mongodb://${username}:${password}@${mongodbServer}`
const client = new MongoClient(url, { useNewUrlParser: true })

client.connect(function (err) {
  if (err) {
    console.log(err)
    logger.error('Unable to connect to MongoDB')
    return
  }
  module.exports.db = client.db(mongodbDb)
  logger.info(`Connected to MongoDB: ${mongodbDb}`)
})

module.exports.client = client
