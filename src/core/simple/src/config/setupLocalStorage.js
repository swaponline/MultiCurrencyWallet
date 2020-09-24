const { mkdir } = require('fs')

module.exports = (dirName = '.storage') => mkdir(dirName, err => {})
