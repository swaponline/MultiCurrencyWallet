import axios from 'axios'
import { constants, localStorage } from 'helpers'
import config from 'helpers/externalConfig'


const saveUserData = function saveUserData(data) {
  const { key, value } = data
  window.localStorage.setItem(key, JSON.stringify(value))

  const interval = window.setInterval(() => {
    const isWalletCreate = localStorage.getItem(constants.localStorage.isWalletCreate)

    if (isWalletCreate
      && config
      && config.opts
      && config.opts.plugins
      && config.opts.plugins.userDataPluginApi
      && window.WPuserUid
      && config.opts.WPuserHash
    ) {
      const { user } = localStorage.getItem('redux-store')

      const curKeys = Object.keys(user).filter(el => {
        if (el !== 'tokensData') {
          return el.includes('Data')
        }
        return false
      })

      const data = {}
      curKeys.forEach(el => {
        const { address, balance } = user[el]

        if (address) {
          data[el] = {
            address,
            balance,
          }
        }

      })

      Object.keys(user.tokensData).forEach((key) => {
        const { balance, address } = user.tokensData[key]
        if (address) {
          data[key] = {
            balance,
            address,
          }
        }
      })

      if (data && Object.values(data).length) {
        axios.post(config.opts.plugins.userDataPluginApi, {
          ...data,
          WPuserUid: window.WPuserUid,
          WPuserHash: config.opts.WPuserHash,
        })
      }
      window.clearInterval(interval)
    }
  }, 10000)
}

export default saveUserData
