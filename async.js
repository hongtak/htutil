// ------ Async Helpers function
const mapAsync = async (list, fn) => {
  return Promise.all(list.map(fn))
}

const flatMapAsync = async (list, fn) => {
  const result = await Promise.all(list.map(fn))
  return result.flatMap(x => x)
}

const filterAsync = async (list, fn) => {
  return mapAsync(list, fn).then(_arr => list.filter((v, i) => _arr[i]))
}

const mapAsyncSeries = async (list, callback) => {
  return list.reduce(async (acc, item) => {
    const accumulator = await acc
    const data = await callback(item)
    accumulator.push(data)
    return accumulator
  }, [])
}

const filterAsyncSeries = async (list, fn) => {
  return list.reduce(async (acc, item) => {
    const accumulator = await acc
    if (await fn(item)) {
      accumulator.push(item)
    }
    return accumulator
  }, [])
}

module.exports = {
  mapAsync,
  filterAsync,
  mapAsyncSeries,
  filterAsyncSeries,
  flatMapAsync
}
