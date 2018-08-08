import reducers from 'redux/core/reducers'
import config from 'app-config'

const checkServers = () => Promise.all(
  Object.keys(config.apiAlternatives).map(provider => {
    return Promise.race(
      config.apiAlternatives[provider].map(
        (server)=> new Promise((resolve, reject) => {
          fetch(`${server}/status`).then(()=>resolve(server)).catch(e=>reject(e));
        })
      )
    ).then(chosen => {
      reducers.api.switchApiServer(provider, chosen);
      console.log(`[${provider}] ${chosen} is OK, using it`)
    })
  })
).then(()=> {
  console.log('All servers is OK.');
});

export default {
  checkServers
}
