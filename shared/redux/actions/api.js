import reducers from 'redux/core/reducers'
import config from 'app-config'




const checkServers = () => {
  reducers.api.setChecked(false)
  return Promise.all(
    Object.keys(config.apiAlternatives).map(provider => Promise.race(
      config.apiAlternatives[provider].map(
        (server) => new Promise((resolve, reject) => {
          fetch(`${server}/status`).then(() => resolve(server)).catch(e => reject(e))
        })
      )
    ).then(chosen => {
      reducers.api.setApiServer(provider, chosen)
      console.log(`[${provider}] ${chosen} is OK, using it`)
    })
    )
  ).then(() => {
    reducers.api.setChecked(true)
    console.log('All servers is OK.')
  }).catch(e => reducers.api.setErrors(true))
}

export default {
  checkServers,
}
