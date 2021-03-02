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
  error: IError
}

@cssModules(styles, { allowMultiple: true })
export default class Farm extends React.Component<null, FarmState> {
  constructor(props) {
    super(props)


    
    // FIXME: delete. Init data - just for test
    window.localStorage.setItem('ff-account-unlocked', 'true')
    // 0xCA701f5904A9659C3970D5e3Cf1c150D5bfbE1Af farm
    // 0x7E0480Ca9fD50EB7A3855Cf53c347A1b4d6A2FF5 xeenus
    // 0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA weenus
    // 0xF6fF95D53E08c9660dC7820fD5A775484f77183A yeenus
    window.farm = {
      farmAddress: '0xCA701f5904A9659C3970D5e3Cf1c150D5bfbE1Af',
      stakingAddress: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
      rewardsAddress: '0xF6fF95D53E08c9660dC7820fD5A775484f77183A',
    }
    // *****************************************


    this.state = {
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
     * LocalStorage key 'ff-account-unlocked' must be true value
     * otherwise will open a modal window for metamask connection
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
      //   onStartLoading: () => null,
      //   onFinishLoading: () => {
      //     // farmDeployer.deploy({
      //     //   rewardsAddress: '0xF6fF95D53E08c9660dC7820fD5A775484f77183A',
      //     //   stakingAddress: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
      //     //   duration: 2000003,
      //     //   decimal: 18,
      //     //   onSuccess: (address) => console.log('Farm address:', address),
      //     //   onError: (err) => console.error(err),
      //     // })
      //   },
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
