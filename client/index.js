import React from 'react'
import ReactDOM from 'react-dom'
import routes from 'routes'
import store, { history } from 'redux/store'

import Root from 'containers/Root/Root'

// import './ipfs'
// import IpfsRoom from './ipfs-pubsub-room'


// window.IpfsRoom = IpfsRoom


ReactDOM.render(
  <Root history={history} store={store} routes={routes} />,
  document.getElementById('root')
)
