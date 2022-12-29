const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

const { CheckPublicKey } = require('./btcutils.js')


let users = {}
/*
  users = {
    'wallet' => {
      'publickKey',
      'phone',
      'rawTX',
      'sms',
    }
  }
*/

const save = async () => {
  
}

const load = async () => {
  const createQuery = 'CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, wallet TEXT, public TEXT, phone TEXT, mainnet INT);';
  db.serialize( async () => {
    db.run(createQuery)
    await db.each('SELECT * FROM users', function(err, row) {

      const key = `${row.wallet}:${(row.mainnet) ? 'M' : 'T'}`

      users[key] = {
        address: row.wallet,
        publicKey: row.public,
        phone: row.phone,
        rawTX: '',
        sms: '',
        mainnet: row.mainnet ? true : false
      }
    }, () => {
      console.log('Database loaded. Users: '+Object.keys(users).length)
    })
  })
}

const add = (walletAddress, publicKey, phone, checkSign, mainnet) => {
  if (CheckPublicKey(walletAddress, publicKey, checkSign, mainnet)) {
    const key = `${walletAddress}:${(mainnet) ? 'M' : 'T'}`
    users[key] = {
      address: walletAddress,
      publicKey,
      phone,
      rawTX: '',
      sms: '',
    }
    db.serialize( () => {
      const stmt = db.prepare('INSERT INTO users VALUES (?,?,?,?,?)');
      stmt.run(null, walletAddress, publicKey, phone, mainnet ? 1 : 0)
      stmt.finalize();
    })
    return true
  } else {
    return { error: 'Sign check failed' }
  }
}


const exist = (walletAddress, publicKey, mainnet) => {
  const key = `${walletAddress}:${(mainnet) ? 'M' : 'T'}`
  if (users[key] && (users[key].publicKey === publicKey)) {
    return {
      phone: users[key].phone
    }
  }
  return false
}

const pushTX = (walletAddress, publicKey, rawTX, checkSign, mainnet) => {
  const key = `${walletAddress}:${(mainnet) ? 'M' : 'T'}`
  if (CheckPublicKey(walletAddress, publicKey, checkSign, mainnet)) {
    if (users[key]) {
      if (users[key].publicKey === publicKey) {
        users[key].rawTX = rawTX
        return {
          phone: users[key].phone
        }
      } else {
        return { error: 'PublicKey not equals' }
      }
    } else {
      return { error: 'Users not found' }
    }
  } else {
    return { error: 'Sign check failed' }
  }
}

const pushSMS = (walletAddress, publicKey, mainnet, sms) => {
  const key = `${walletAddress}:${(mainnet) ? 'M' : 'T'}`
  if (users[key] && (users[key].publicKey === publicKey)) {
    users[key].sms = sms
    return true
  }
  return false
}

const validateSMS = (walletAddress, publicKey, sms, checkSign, mainnet) => {
  const key = `${walletAddress}:${(mainnet) ? 'M' : 'T'}`
  if (CheckPublicKey(walletAddress, publicKey, checkSign, mainnet)) {
    if (users[key]) {
      if (users[key].publicKey === publicKey) {
        if (users[key].sms === sms) {
          return users[key].rawTX
        } else {
          return { error: 'SMS code not valid' }
        }
      } else {
        return { error: 'PublicKey not equals' }
      }
    } else {
      return { error: 'Users not found' }
    }
  } else {
    return { error: 'Sign check failed' }
  }
}

module.exports = {
  users,
  load,
  save,
  add,
  exist,
  pushTX,
  pushSMS,
  validateSMS,
}