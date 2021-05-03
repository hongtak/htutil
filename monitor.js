import redis from 'redis'
const opt = {
  host: '10.0.20.151',
  password: 'hungryrabbit112'
}
const client = redis.createClient(opt);

client.monitor((err, res) => {
  console.log('Entering monitoring mode.')
  console.log(err)
  console.log(res)
})

client.on('monitor', (time, args, rawReply) => {
  // console.log(time + ': ' + args) // 1458910076.446514:['set', 'foo', 'bar']
  console.log(rawReply)
})