const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');
const { SHA3 } = require('sha3');

const { CheckPublicKey } = require('./btcutils.js')


let users = {}
/*
  users = {
    'wallet' => {
      'publickKey',
      'passhash',
    }
  }
*/

const save = async () => {
  
}

const load = async () => {
  const createQuery = "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, wallet TEXT, public TEXT, passhash TEXT, mainnet INT);";
  db.serialize( async () => {
    db.run(createQuery)
    await db.each('SELECT * FROM users', function(err, row) {

      const key = `${row.wallet}:${(row.mainnet) ? 'M' : 'T'}`

      let publicKey = row.public

      try {
        publicKey = JSON.parse(publicKey)
        publicKey = JSON.stringify((publicKey instanceof Array) ? publicKey : [publicKey])
      } catch (e) {
        publicKey = JSON.stringify([publicKey])
      }

      if (!users[key]) users[key] = []
      users[key].push({
        address: row.wallet,
        publicKey,
        passhash: row.passhash,
        mainnet: row.mainnet ? true : false
      })
    }, () => {
      console.log('Database loaded. Users: '+Object.keys(users).length)
    })
  })
}

const getPassHash = (password) => {
  const passwordSha = new SHA3(256)
  passwordSha.update(password)

  return passwordSha.digest('hex')
}
const add = (walletAddress, publicKey, password, checkSign, mainnet) => {
  if (CheckPublicKey(walletAddress, publicKey, checkSign, mainnet)) {
    const key = `${walletAddress}:${(mainnet) ? 'M' : 'T'}`

    const passhash = getPassHash(password)

    try {
      const publicKeys = JSON.parse(publicKey)
      // if ok - new 2of3 or 2of2
    } catch (e) {
      // old 2of2 and old react builds
      publicKey = JSON.stringify([publicKey])
    }

    if (!users[key]) users[key] = []
    users[key].push({
      address: walletAddress,
      publicKey,
      passhash,
    })
    
    db.serialize( () => {
      const stmt = db.prepare('INSERT INTO users VALUES (?,?,?,?,?)');
      stmt.run(null, walletAddress, publicKey, passhash, mainnet ? 1 : 0)
      stmt.finalize();
    })
    return true
  } else {
    return { error: 'Sign check failed' }
  }
}


const exist = (walletAddress, publicKey, mainnet) => {
  const key = `${walletAddress}:${(mainnet) ? 'M' : 'T'}`
  console.log('>>> key', key)
  console.log(users[key])
  if (users[key] && users[key].length) {
    let result = false
    users[key].forEach( (wallet) => {
      if (wallet.publicKey == publicKey) {
        result = {
          passhash: wallet.passhash
        }
        return false
      }
    })
    return result
  }
  return false
}

module.exports = {
  users,
  load,
  save,
  add,
  exist,
  getPassHash,
}