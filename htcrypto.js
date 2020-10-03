const crypto = require('crypto')
const ecdh = crypto.createECDH('secp521r1')
const config = require('../config.json')

const loggerlib = require('./loggerlib')
const logger = loggerlib.createLogger(config.logger, 'htcrypto')

const symmetricKeyLength = 32
const hashType = 'sha256'
const hashLength = 32
var salt = Buffer.alloc(0)
var info = Buffer.alloc(0)

let sharedSecret = Buffer.alloc(0)
let symmetricKey = Buffer.alloc(0)

const init = () => {
  logger.info('Initialized')
  generateKeys()
}

const configure = (config) => {
  ecdh.setPrivateKey(Buffer.from(config.privateKey.value, config.privateKey.encoding))
  salt = Buffer.from(config.salt.value, config.salt.encoding)
  info = Buffer.from(config.info.value, config.info.encoding)
}

const computeSecret = (publicKey, encoding) => {
  sharedSecret = ecdh.computeSecret(publicKey, encoding)
}

const setSymmetricKey = (key) => {
  symmetricKey = key
}

const getSymmetricKey = () => {
  return symmetricKey
}

const getPublicKey = () => {
  return ecdh.getPublicKey()
}

const generateKeys = () => {
  ecdh.generateKeys()
}

const deriveHKDFKey = () => {
  var t = Buffer.alloc(0)
  var okm = Buffer.alloc(0)
  const prk = hmacHash(salt, sharedSecret)
  for (var i = 0; i < symmetricKeyLength / hashLength; i++) {
    const x = Buffer.concat([t, info, Buffer.from([i + 1])])
    t = hmacHash(prk, x)
    okm = Buffer.concat([okm, t])
  }
  symmetricKey = okm.slice(0, symmetricKeyLength)
}

const chachaCipher = (plaintext, encoding) => {
  // chacha20-poly1305
  plaintext = Buffer.from(plaintext, encoding)

  const nonce = crypto.randomBytes(12)
  const chachaPolyCipher = crypto.createCipheriv('chacha20-poly1305', symmetricKey, nonce, { authTagLength: 16 })
  const encrypted = chachaPolyCipher.update(plaintext)
  chachaPolyCipher.final()
  const tag = chachaPolyCipher.getAuthTag()
  return Buffer.concat([nonce, encrypted, tag])
}

const chachaDecipher = (encrypted, encoding) => {
  encrypted = Buffer.from(encrypted, encoding)
  // first 12 bytes: nonce
  // data
  // last 16 bytes: tag
  const len = encrypted.length
  const nonce = encrypted.slice(0, 12)
  const tag = encrypted.slice(len - 16, len)
  const data = encrypted.slice(12, len - 16)
  const chachaPolyDecipher = crypto.createDecipheriv('chacha20-poly1305', symmetricKey, nonce, { authTagLength: 16 })
  const decrypted = chachaPolyDecipher.update(data)
  chachaPolyDecipher.setAuthTag(tag)
  chachaPolyDecipher.final()
  return decrypted
}

// Hmac
const hmacHash = (key, data) => {
  const hmac = crypto.createHmac(hashType, key)
  hmac.update(data)
  return hmac.digest()
}

// ----------- AES
const aesCipher = (plaintext, encoding) => {
  // aes-256-gcm
  plaintext = Buffer.from(plaintext, encoding)

  const nonce = crypto.randomBytes(12)
  const aesCipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, nonce, { authTagLength: 16 })
  const encrypted = aesCipher.update(plaintext)
  aesCipher.final()
  const tag = aesCipher.getAuthTag()
  return Buffer.concat([nonce, encrypted, tag])
}

const aesDecipher = (encrypted, encoding) => {
  // aes-256-gcm
  encrypted = Buffer.from(encrypted, encoding)

  const len = encrypted.length
  const nonce = encrypted.slice(0, 12)
  const tag = encrypted.slice(len - 16, len)
  const data = encrypted.slice(12, len - 16)
  const aesDecipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, nonce, { authTagLength: 16 })
  const decrypted = aesDecipher.update(data)
  aesDecipher.setAuthTag(tag)
  aesDecipher.final()
  return decrypted
}

const debug = () => {
  logger.info('symmetric key:', symmetricKey.toString('hex'))
}
// Initialization
init()

module.exports = {
  computeSecret,
  deriveHKDFKey,
  getPublicKey,
  generateKeys,
  chachaCipher,
  chachaDecipher,
  configure,
  aesCipher,
  aesDecipher,
  debug,
  setSymmetricKey,
  getSymmetricKey
}
