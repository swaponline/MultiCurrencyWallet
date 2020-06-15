import getUnixTimeStamp from './getUnixTimeStamp'


const localStorage = window.localStorage

const push = ({ key, data, time }) => {
  console.log('lsDataCache push', key, time, data)
  const cacheData = {
    data,
    time,
    createtime: getUnixTimeStamp(),
  }

  let cacheKeys = localStorage.getItem(`${process.env.ENTRY}:cacheKeys`)
  try {
    cacheKeys = JSON.parse(cacheKeys)
  } catch (e) {}
  if (!cacheKeys) cacheKeys = {}

  cacheKeys[key] = cacheData.createtime + cacheData.time
  localStorage.setItem(`${process.env.ENTRY}:cache:${key}`, JSON.stringify(cacheData))
  localStorage.setItem(`${process.env.ENTRY}:cacheKeys`, JSON.stringify(cacheKeys))
}

const get = (key) => {
  console.log('lsDataCache get', key)
  let data = localStorage.getItem(`${process.env.ENTRY}:cache:${key}`)
  try {
    data = JSON.parse(data)
    if (data && data.data) {
      console.log('exists', data.data)
      return data.data
    }
    return false
  } catch(e) {
    return false
  }
}

const remove = (key) => {
  console.log('lsDataCache remove', key)
  localStorage.removeItem(`${process.env.ENTRY}:cache:${key}`)
}

const cleanup = () => {
  let cacheKeys = localStorage.getItem(`${process.env.ENTRY}:cacheKeys`)
  const newKeys = {}
  try {
    cacheKeys = JSON.parse(cacheKeys)
  } catch (e) {}
  if (!cacheKeys) cacheKeys = {}

  const curTime = getUnixTimeStamp()

  Object.keys(cacheKeys).forEach( (key) => {
    if (!cacheKeys[key] || (curTime > cacheKeys[key])) {
      remove(key)
    } else {
      newKeys[key] = cacheKeys[key]
    }
  })

  localStorage.setItem(`${process.env.ENTRY}:cacheKeys`, JSON.stringify(newKeys))
}

cleanup()

export default {
  push,
  get,
  remove,
  cleanup,
}