import Hashids from 'hashids'

// const hashids = new Hashids('callisto', 11, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-', '1234567890')
const hashids = new Hashids('callisto')

const bigNum = 1e12
const numId = 1000000

for (let i = 0; i < 10; i++) {
  const id = hashids.encode(bigNum + i)
  const decoded = hashids.decode(id)
  console.log(`i: ${decoded} - id: ${id} [len: ${id.length}]`)
}

const start = process.hrtime.bigint()
for (let i = 0; i < numId; i++) {
  const id = hashids.encode(bigNum + i)
  // const decoded = hashids.decode(id)
  // console.log(`i: ${decoded} - id: ${id} [len: ${id.length}]`)
}
const end = process.hrtime.bigint()
const time = Number(end - start) / 1e9
const rate = numId / (Number(end - start) / 1e9)
console.log(`${time}s, ${numId} ids - ${rate}/s`)

const createRate = 10000
console.log(`if create ${createRate} id per second: ${bigNum / (createRate * 60 * 60 * 24 * 365)} year`)
