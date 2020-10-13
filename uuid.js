const crypto = require('crypto')

const randomPool = Buffer.alloc(256)
let ptr = randomPool.length

function random () {
  if (ptr > randomPool.length - 16) {
    crypto.randomFillSync(randomPool)
    ptr = 0
  }
  return randomPool.slice(ptr, (ptr += 16))
}

function uuidv4 () {
  const bytes = random()
  bytes[6] = (bytes[6] | 0x40) & 0x4F
  bytes[8] = (bytes[8] | 0x80) & 0xBF
  return format(bytes)
}

function format (buffer) {
  const str = buffer.toString('hex')
  return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20, 32)}`
}

module.exports = {
  uuidv4
}
