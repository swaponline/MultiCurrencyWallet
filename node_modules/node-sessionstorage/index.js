const _storage = {}

const sessionStorage = {
  setItem: (key, value) => _storage[key] = value,
  getItem: (key) => _storage[key],
  removeItem: (key) => delete _storage[key],
}

module.exports = sessionStorage

