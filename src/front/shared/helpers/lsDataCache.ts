import getUnixTimeStamp from 'common/utils/getUnixTimeStamp'

const localStorage = window.localStorage

const push = ({ key, data, time }) => {
  const cacheData = {
    data,
    time,
    createtime: getUnixTimeStamp(),
  }

  let cacheKeys = localStorage.getItem(`${process.env.ENTRY}:cacheKeys`)
  try {
    //@ts-ignore: strictNullChecks
    cacheKeys = JSON.parse(cacheKeys)
  } catch (e) {}
  //@ts-ignore
  if (!cacheKeys) cacheKeys = {}
  //@ts-ignore
  cacheKeys[key] = cacheData.createtime + cacheData.time
  localStorage.setItem(`${process.env.ENTRY}:cache:${key}`, JSON.stringify(cacheData))
  localStorage.setItem(`${process.env.ENTRY}:cacheKeys`, JSON.stringify(cacheKeys))
}

const get = (key) => {
  let data = localStorage.getItem(`${process.env.ENTRY}:cache:${key}`)
  try {
    //@ts-ignore: strictNullChecks
    data = JSON.parse(data)
    //@ts-ignore
    if (data && data.data) {
      //@ts-ignore
      return data.data
    }
    return false
  } catch (e) {
    return false
  }
}

const remove = (key) => {
  localStorage.removeItem(`${process.env.ENTRY}:cache:${key}`)
}

const cleanup = () => {
  let cacheKeys = localStorage.getItem(`${process.env.ENTRY}:cacheKeys`)
  const newKeys = {}
  try {
    //@ts-ignore: strictNullChecks
    cacheKeys = JSON.parse(cacheKeys)
  } catch (e) {}
  //@ts-ignore
  if (!cacheKeys) cacheKeys = {}

  const curTime = getUnixTimeStamp()

  //@ts-ignore: strictNullChecks
  Object.keys(cacheKeys).forEach((key) => {
    //@ts-ignore: strictNullChecks
    if (!cacheKeys[key] || (curTime > cacheKeys[key])) {
      remove(key)
    } else {
      //@ts-ignore: strictNullChecks
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
