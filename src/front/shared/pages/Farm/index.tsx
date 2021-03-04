import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import styles from './index.scss'
import config from 'app-config'
import factoryStyles from './lib/farmfactory.css'
import { farmFactory } from './lib/farmfactory'
import { feedback, metamask, web3 } from 'helpers'
import { ethereumProxy } from 'helpers/web3'

@cssModules(styles, { allowMultiple: true })
export default class Farm extends React.Component<null, null> {
  constructor(props) {
    super(props)

    if (!metamask.isConnected()) {
      // LocalStorage key 'ff-account-unlocked' must be true value
      // otherwise will open a modal window for metamask connection
      window.localStorage.setItem('ff-account-unlocked', 'true')
    } else {
      window.localStorage.setItem('ff-account-unlocked', 'false')
    }

    // FIXME: delete test data
    window.farm = {
      farmAddress: '0x71a335D51F111CC596be62A7FA2E8B167929A6F2',
      stakingAddress: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
      rewardsAddress: '0x7E0480Ca9fD50EB7A3855Cf53c347A1b4d6A2FF5',
    }
  }

  componentDidMount() {
    feedback.farm.started()

    // hasn't plugin in the browser
    if (!metamask.isConnected()) {      
      if (!window.web3) {
        window.web3 = web3
      }
      // if false it means that metamask isn't connected
      // to our wallet but it's in browser and for plugin
      // it's enougth
      if (!window.ethereum) {
        window.ethereum = ethereumProxy
      }
    }

    if (window.farm) {
      const { 
        farmAddress,
        rewardsAddress,
        stakingAddress,
      } = window.farm
  
      farmFactory.init({
        networkName: config.entry === 'testnet' ? 'ropsten' : 'mainnet',
        farmAddress: farmAddress,
        rewardsAddress: rewardsAddress,
        stakingAddress: stakingAddress,
      })
    }
  }

  reportError = (error) => {
    feedback.farm.failed(`error name(${error.name}) : error message(${error.message})`)
    console.error(error)
  }

  render() {
    return (
      <section styleName="farm">
        {window.farm ? (
            <>
              <div id="farmfactory-timer-root" styleName="timer"></div>
              {/* own style for plugin */}
              <div style={factoryStyles} id="farmfactory-widget-root"></div>
            </>
          ) : (
            <h3>
              <FormattedMessage 
                id="FarmDoesNotHaveContracts" 
                defaultMessage="Doesn't have any contracts"
              />
            </h3>
          )
        }
      </section>
    )
  }
}
