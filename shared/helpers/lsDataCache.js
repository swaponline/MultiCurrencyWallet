import getUnixTimeStamp from './getUnixTimeStamp'
import localStorage from './localStorage'



const push = ({ key, data, time }) => {
  const data = {
    data,
    time,
    createtime: getUnixTimeStamp(),
  }

  const cacheKeys = localStorage.getItem(`${process.env.ENTRY}:cacheKeys`)
  try {
    cacheKeys = JSON.parse(cacheKeys)
  } catch (e) {}
  if (!cacheKeys) cacheKeys = {}

  cacheKeys[key] = data.createtime + data.time
 // localStorage.setItem(`${process.env.ENTRY}:cache:${key}`, JSON.seri
}

const get = (key) => {
}

const delete = (key) => {
}

const cleanup = () => {
}

cleanup()

export default {
  push,
  get,
  delete,
  cleanup,
}