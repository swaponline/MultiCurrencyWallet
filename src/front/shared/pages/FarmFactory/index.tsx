import React from 'react'
import cssModules from 'react-css-modules'
import styles from './index.scss'
import actions from 'redux/actions'
import { connect } from 'redaction'
import factoryStyles from './libs/farmfactory.css'
import { farmDeployer } from './libs/farmdeployer'
import { farmFactory } from './libs/farmfactory'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button } from 'components/controls'
import { constants, feedback, metamask, web3 } from 'helpers'
import { ethProxy } from './ethProxy'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type FarmFactoryState = {
  rewardsAddress: string
  stakingAddress: string
  btnEnable: boolean
  duration: number
  decimal: number
  error: IError
}
@injectIntl
@connect(
  ({
    user: {
      ethData,
    }
  }) => ({
    ethPrivateKey: ethData.privateKey,
  })
)
@cssModules(styles, { allowMultiple: true })
export default class FarmFactory extends React.Component<IUniversalObj, FarmFactoryState> {
  constructor(props) {
    super(props)

    // const { ethPrivateKey } = props
    // const loginResult = actions.eth.login(ethPrivateKey)
    // console.log('loginResult: ', loginResult)

    this.state = {
      btnEnable: true,
      rewardsAddress: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
      stakingAddress: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
      duration: 2000003,
      decimal: 18,
      error: null,
    }
  }

  componentDidMount() {
    feedback.farmFactory.started()

    if (!metamask.isConnected()) {
      window.web3 = web3
      window.ethereum = ethProxy
    }

    farmDeployer.init({
      rewardsAddress: '',
      stakingAddress: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
      duration: 2000003,
      decimal: 18,
      onStartLoading: () => this.setBtnEnable(false),
      onFinishLoading: () => this.setBtnEnable(true),
      onError: (error) => this.reportError(error),
    })

    farmFactory.init({
      networkName: 'ropsten', // mainnet, ropsten, kovan
      farmAddress: '0x38054641b795fb9604961b4c18b871f42bf8afb0',
      rewardsAddress: '0x93d83a81905a1baf4615bcb51db3f2f2bbf6ab9e',
      stakingAddress: '0xc3eC8ED5Ce2a19CA40210002116712645dBEceC4',
    })
  }

  componentDidCatch(error) {
    this.reportError(error)
  }

  setBtnEnable = (btnState) => {
    this.setState({
      btnEnable: btnState,
    })
  }

  handlerDeploy = () => {
    const { rewardsAddress, stakingAddress, duration, decimal } = this.state

    this.setBtnEnable(false)

    farmDeployer.deploy({
      rewardsAddress: rewardsAddress,
      stakingAddress: stakingAddress,
      duration: duration,
      decimal: decimal,
      onSuccess: (address) => this.onDeploySuccess(address),
      onError: (error) => this.reportError(error),
    })
  }

  onDeploySuccess = (address) => {
    this.setBtnEnable(true)
    feedback.farmFactory.deployed()
    console.log('Contract address:', address)

    actions.modals.open(constants.modals.AlertModal, {
      message: (
        <p>
          <FormattedMessage 
            id="FarmFactoryContractDeployed"
            defaultMessage="Successful! Contract address:"
          />
          <br />
          <span>{address}</span>
        </p>
      ),
    })
  }

  reportError = (error) => {
    if (error.code === 4001) {
      // denied transaction
      this.setBtnEnable(true)
    } else {
      this.setBtnEnable(false)
    }
    feedback.farmFactory.failed(`error name(${error.name}) : error message(${error.message})`)
    console.error(error)
    this.setState({
      error,
    })
  }

  render() {
    const { rewardsAddress, stakingAddress, duration, decimal, btnEnable } = this.state

    return (
      <section styleName={`farmFactory ${isDark ? 'dark' : ''}`}>
        {/* own style for widget */}
        <div style={factoryStyles} id="farmfactory-widget-root"></div>

        <div styleName="farmDeployForm">
          <label>
            Rewards address:
            <input
              onChange={(event) => this.setState({ rewardsAddress: event.target.value })}
              type="text"
              defaultValue={rewardsAddress}
            />
          </label>
          <label>
            Staking address:
            <input
              onChange={(event) => this.setState({ stakingAddress: event.target.value })}
              type="text"
              defaultValue={stakingAddress}
            />
          </label>
          <label>
            Duration:
            <input
              onChange={(event) => this.setState({ duration: +event.target.value })}
              type="number"
              defaultValue={duration}
            />
          </label>
          <label>
            Decimal:
            <input
              onChange={(event) => this.setState({ decimal: +event.target.value })}
              type="number"
              defaultValue={decimal}
            />
          </label>
          <Button id="button" brand blue disabled={!btnEnable} onClick={this.handlerDeploy}>
            <FormattedMessage id="FarmFactoryDeployButton" defaultMessage="Deploy" />
          </Button>
        </div>
      </section>
    )
  }
}
