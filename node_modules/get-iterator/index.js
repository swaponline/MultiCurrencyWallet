// If the passed object is an (async) iterable, then get the iterator
// If it's probably an iterator already (i.e. has next function) return it
// else throw
module.exports = function getIterator (obj) {
  if (obj) {
    if (typeof obj[Symbol.iterator] === 'function') {
      return obj[Symbol.iterator]()
    }
    if (typeof obj[Symbol.asyncIterator] === 'function') {
      return obj[Symbol.asyncIterator]()
    }
    if (typeof obj.next === 'function') {
      return obj // probably an iterator
    }
  }
  throw new Error('argument is not an iterator or iterable')
}
