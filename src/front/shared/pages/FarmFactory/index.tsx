import React from 'react'
import cssModules from 'react-css-modules'
import styles from './index.scss'
import config from 'app-config'
import factoryStyles from './lib/farmfactory.css'
// import { farmDeployer } from './lib/farmdeployer'
import { farmFactory } from './lib/farmfactory'
import { constants, feedback, metamask, web3 } from 'helpers'
import { ethereumProxy } from 'helpers/web3'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type FarmFactoryState = {
  internalAddress: string
  duration: number
  decimal: number
  error: IError
}

@cssModules(styles, { allowMultiple: true })
export default class FarmFactory extends React.Component<null, FarmFactoryState> {
  constructor(props) {
    super(props)

    this.state = {
      internalAddress: '',
      duration: 2000003, // ~ 9.25 hours
      decimal: 18,
      error: null,
    }
  }

  componentDidMount() {
    feedback.farmFactory.started()

    // hasn't plugin in the browser
    if (!metamask.isConnected()) {      
      if (!window.web3) {
        window.web3 = web3
      }
      // if false it means that user has plugin,
      // but metamask isn't connected to our wallet
      if (!window.ethereum) {
        window.ethereum = ethereumProxy
      }
    }

    // 'ff-account-unlocked' - this key must be in the localStorage
    // if web3 account is available

    // const isAccountUnlocked = window.localStorage.setItem('ff-account-unlocked', 'true)

    // FIXME: for test
    // window.farm = {
    //   farmAddress: '0xdf7c806Bc128667f5394e3E9e9d5C1F56c8C9A44',
    //   rewardsAddress: '0xdf7c806Bc128667f5394e3E9e9d5C1F56c8C9A44',
    //   stakingAddress: '0xdf7c806Bc128667f5394e3E9e9d5C1F56c8C9A44',
    // }
    // FIXME:

    const { 
      farmAddress,
      rewardsAddress,
      stakingAddress,
    } = window.farm

    // farmDeployer.init({
    //   rewardsAddress: '',
    //   stakingAddress: internalAddress,
    //   duration: 2000003,
    //   decimal: 18,
    //   // onStartLoading: () => null,
    //   // onFinishLoading: () => null,
    //   onError: (error) => this.reportError(error),
    // })

    farmFactory.init({
      networkName: config.entry === 'testnet' ? 'ropsten' : 'mainnet',
      farmAddress: farmAddress,
      rewardsAddress: rewardsAddress,
      stakingAddress: stakingAddress,
    })
  }

  componentDidCatch(error) {
    this.reportError(error)
  }

  reportError = (error) => {
    feedback.farmFactory.failed(`error name(${error.name}) : error message(${error.message})`)
    this.setState({  error })
    console.error(error)
  }

  render() {
    const { error } = this.state

    return (
      <section styleName={`farmFactory ${isDark ? "dark" : ""}`}>
        {/* own style for widget */}
        <div style={factoryStyles} id="farmfactory-widget-root"></div>

        {error && (
            <div styleName='farmFactoryErrorWrapper'>
              <h3>Error</h3>
              {error.code && <p>Code: {error.code}</p>}
              {error.name && <p>Name: {error.name}</p>}
              {error.message && <p>Message: {error.message}</p>}
            </div>
          )
        }
      </section>
    )
  }
}
