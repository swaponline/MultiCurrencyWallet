const namedQuery = {}
const namedQueryTimers = {}
const namedQueryTicks = 10

const namedQueryTimer = (queryName) => {
  if (namedQuery[queryName].length) {
    const queryChunk = namedQuery[queryName].shift()
    const {
      resolve: onResolve,
      error: onError,
      delay,
      func,
      isAsync,
    } = queryChunk

    new Promise(async (resolve, reject) => {
      try {
        const ret = await func()

        if (typeof onResolve === `function`) onResolve(ret)
        namedQueryTimers[queryName] = setTimeout(() => {
          namedQueryTimer(queryName)
        }, delay)
      } catch (err) {
        if (typeof onError === `function`) onError(err)
        namedQueryTimers[queryName] = setTimeout(() => {
          namedQueryTimer(queryName)
        }, delay)
      }
    })
  } else {
    namedQueryTimers[queryName] = setTimeout(() => {
      namedQueryTimer(queryName)
    }, namedQueryTicks)
  }
}

const namedQueryInit = (queryName) => {
  if (!namedQuery[queryName]) namedQuery[queryName] = []
  if (!namedQueryTimers[queryName]) { 
    namedQueryTimers[queryName] = setTimeout(() => {
      namedQueryTimer(queryName)
    }, namedQueryTicks)
  }
}

const namedQueryRun = (options) => {
  const {
    name: queryName,
    resolve,
    error,
    delay,
    func,
    isAsync,
  } = options


  namedQueryInit(queryName)
  namedQuery[queryName].push(options)
}

export default namedQueryRun