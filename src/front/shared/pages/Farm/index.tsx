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

type FarmState = {
  duration: number
  decimal: number
  error: IError
}

@cssModules(styles, { allowMultiple: true })
export default class Farm extends React.Component<null, FarmState> {
  constructor(props) {
    super(props)


    // FIXME: delete. Init data - just for test
    window.localStorage.setItem('ff-account-unlocked', 'true')
    // 0x7E0480Ca9fD50EB7A3855Cf53c347A1b4d6A2FF5 xeenus
    // 0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA weenus
    window.farm = {
      farmAddress: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
      stakingAddress: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
      rewardsAddress: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
    }

    this.state = {
      duration: 2000003, // ~ 9.25 hours
      decimal: 18,
      error: null,
    }
  }

  componentDidMount() {
    feedback.farm.started()

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

    /**
     * Tip for init data:
     * LocalStorage key 'ff-account-unlocked' has to true value
     * without metamask and if web3 account is available
     * 
     * Options for factory:
     * farmAddress
     * rewardsAddress
     * stakingAddress
     */

    if (window.farm) {
      const { 
        farmAddress,
        rewardsAddress,
        stakingAddress,
      } = window.farm
  
      // farmDeployer.init({
      //   rewardsAddress: '',
      //   stakingAddress: '',
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
  }

  componentDidCatch(error) {
    this.reportError(error)
  }

  reportError = (error) => {
    feedback.farm.failed(`error name(${error.name}) : error message(${error.message})`)
    this.setState({  error })
    console.error(error)
  }

  render() {
    const { error } = this.state

    return (
      <section styleName={`farm ${isDark ? "dark" : ""}`}>
        {/* own style for widget */}
        <div style={factoryStyles} id="farmfactory-widget-root"></div>

        {error && (
            <div styleName='farmErrorWrapper'>
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
