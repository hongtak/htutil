const crypto = require('crypto')

function uuidv4 () {
  const bytes = crypto.randomBytes(16)
  bytes[6] = (bytes[6] | 0x40) & 0x4F
  bytes[8] = (bytes[8] | 0x80) & 0xBF
  const id = bytes.toString('hex')

  const posArray = [8, 4, 4, 4, 12]
  const output = posArray.reduce((acc, cur) => {
    acc.array.push(acc.str.substring(0, cur))
    acc.str = acc.str.substring(cur)
    return acc
  }, { str: id, array: [] })
  return output.array.join('-')
}

module.exports = {
  uuidv4
}
