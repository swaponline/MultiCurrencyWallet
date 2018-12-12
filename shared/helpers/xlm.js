import sdk from 'stellar-sdk'
import config from 'app-config'


const server = new sdk.Server(config.api.horizon)


if (process.env.MAINNET) {
  sdk.Network.usePublicNetwork()
} else {
  sdk.Network.useTestNetwork()
}


export default {
  server,
}
