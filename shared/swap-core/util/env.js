const env = {
  web3: null,
  bitcoinJs: null,
  Ipfs: null,
  IpfsRoom: null,
  localStorage: global.localStorage,
}

const setupEnv = (values) => {
  Object.keys(values).forEach((key) => {
    env[key] = values[key]
  })
}


export {
  env,
  setupEnv,
}
