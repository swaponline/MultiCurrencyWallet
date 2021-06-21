import getUnixTimeStamp from 'common/utils/getUnixTimeStamp'

const cacheStorage = {}

const cacheStorageGet = (cachePart, cacheKey) => {
  if (cacheStorage[cachePart]
    && cacheStorage[cachePart][cacheKey]
    && (cacheStorage[cachePart][cacheKey].timeout > getUnixTimeStamp())
  ) {
    return cacheStorage[cachePart][cacheKey].value
  }
  return false
}

const cacheStorageSet = (cachePart, cacheKey, cacheValue, cacheTimeout) => {
  if (!cacheStorage[cachePart]) cacheStorage[cachePart] = {}
  cacheStorage[cachePart][cacheKey] = {
    timeout: getUnixTimeStamp() + cacheTimeout,
    value: cacheValue,
  }
}

const cacheStorageClear = (cachePart, cacheKey) => {
  if (cacheStorage[cachePart]) {
    cacheStorage[cachePart][cacheKey] = false
  }
}

const cacheStorageClearPart = (cachePart) => {
  cacheStorage[cachePart] = false
}

export {
  cacheStorageGet,
  cacheStorageSet,
  cacheStorageClear,
  cacheStorageClearPart,
}
