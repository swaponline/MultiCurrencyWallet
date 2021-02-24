import React from 'react'
import cssModules from 'react-css-modules'
import styles from './index.scss'
// import actions from 'redux/actions'
import factoryStyles from './lib/farmfactory.css'
import Link from 'local_modules/sw-valuelink'
import { farmDeployer } from './lib/farmdeployer'
import { farmFactory } from './lib/farmfactory'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button } from 'components/controls'
import { AddressFormat } from 'domain/address'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Address from 'components/ui/Address/Address'
import Input from 'components/forms/Input/Input'
import Copy from 'components/ui/Copy/Copy'
import { isMobile } from 'react-device-detect'
import { constants, feedback, metamask, web3 } from 'helpers'
import { ethereumProxy } from 'helpers/web3'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type FarmFactoryState = {
  deployedContracts: string[]
  internalAddress: string
  rewardsAddress: string
  stakingAddress: string
  formIsOpen: boolean
  btnEnable: boolean
  loading: boolean
  duration: number
  decimal: number
  error: IError
}
@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class FarmFactory extends React.Component<null, FarmFactoryState> {
  constructor(props) {
    super(props)
    
    const internalAddress = web3.eth.accounts.wallet[0].address
    const btnEnable = window.web3 && window.ethereum && true

    this.state = {
      deployedContracts: [],
      internalAddress,
      btnEnable,
      loading: false,
      formIsOpen: false,
      rewardsAddress: internalAddress, // default in input
      stakingAddress: internalAddress, // default in input
      duration: 2000003, // ~ 9.25 hours
      decimal: 18,
      error: null,
    }
  }

  componentDidMount() {
    const { internalAddress } = this.state
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

    farmDeployer.init({
      rewardsAddress: '',
      stakingAddress: internalAddress,
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
    this.setState({ 
      loading: true,
      error: null, 
    })

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
    feedback.farmFactory.deployed()

    this.setBtnEnable(true)
    this.setState((state) => ({
      deployedContracts: [address, ...state.deployedContracts],
      loading: false,
    }))
  }

  toggleFormVisible = () => {
    this.setState((state) => ({
      formIsOpen: !state.formIsOpen,
    }))
  }

  reportError = (error) => {
    feedback.farmFactory.failed(`error name(${error.name}) : error message(${error.message})`)
    console.error(error)

    this.setBtnEnable(true)
    this.setState({ 
      loading: false,
      error, 
    })
  }

  render() {
    const {
      btnEnable,
      formIsOpen,
      deployedContracts,
      error,
      loading,
    } = this.state
    const linked = Link.all(this, 'rewardsAddress', 'stakingAddress', 'duration', 'decimal')

    return (
      <section styleName={`farmFactory ${isDark ? "dark" : ""}`}>
        {/* own style for widget */}
        <div style={factoryStyles} id="farmfactory-widget-root"></div>

        <div styleName="farmDeployForm">
          <div styleName="farmFormHeader">
            <h3><FormattedMessage id="FarmFactoryDeployForm" defaultMessage="Deploy" /></h3>
            <button 
              styleName={`farmFormToggle ${formIsOpen ? "up" : ""}`} 
              onClick={this.toggleFormVisible}
            ></button>
          </div>
          
          <div styleName={`farmFormBody ${formIsOpen ? "" : "hide"}`}>
            <label>
              <FieldLabel>
                <FormattedMessage
                  id="FarmFactoryRewardInputTitle"
                  defaultMessage="Rewards address"
                />
              </FieldLabel>
              <Input
                onKeyDown={(event) => this.setState({ rewardsAddress: event.target.value })}
                valueLink={linked.rewardsAddress}
                disabled={!btnEnable}
                pattern="0-9a-zA-Z:"
                type="text"
              />
            </label>

            <label>
              <FieldLabel>
                <FormattedMessage
                  id="FarmFactoryStakingInputTitle"
                  defaultMessage="Staking address"
                />
              </FieldLabel>
              <Input
                onKeyDown={(event) => this.setState({ stakingAddress: event.target.value })}
                valueLink={linked.stakingAddress}
                disabled={!btnEnable}
                pattern="0-9a-zA-Z:"
                type="text"
              />
            </label>

            <label>
              <FieldLabel>
                <FormattedMessage
                  id="FarmFactoryDurationInputTitle"
                  defaultMessage="Duration"
                />
              </FieldLabel>
              <Input
                onKeyDown={(event) => this.setState({ duration: +event.target.value })}
                valueLink={linked.duration}
                disabled={!btnEnable}
                pattern="0-9\."
                type="number"
              />
            </label>

            <label>
              <FieldLabel>
                <FormattedMessage
                  id="FarmFactoryDecimalInputTitle"
                  defaultMessage="Decimal"
                />
              </FieldLabel>
              <Input
                onKeyDown={(event) => this.setState({ decimal: +event.target.value })}
                valueLink={linked.decimal}
                disabled={!btnEnable}
                pattern="0-9\."
                type='number'
              />
            </label>

            <Button id="button" pending={loading} blue disabled={!btnEnable} onClick={this.handlerDeploy}>
              <FormattedMessage id="FarmFactoryDeployButton" defaultMessage="Deploy" />
            </Button>
          </div>

          {error && (
              <div styleName='farmFactoryErrorWrapper'>
                <h3>Error</h3>
                {error.code && <p>Code: {error.code}</p>}
                {error.name && <p>Name: {error.name}</p>}
                {error.message && <p>Message: {error.message}</p>}
              </div>
            )
          }
        </div>

        <div styleName='farmContracts'>
          <h3><FormattedMessage id="FarmFactoryContracts" defaultMessage="Contracts" /></h3>
          {deployedContracts.length ? (
            <ul>
              {deployedContracts.map((address, index) => (
                <li key={index}>
                  <Copy text={address}>
                    <Address
                      address={address}
                      format={isMobile ? AddressFormat.Short : AddressFormat.Full}
                    />
                  </Copy>
                </li>
              ))
              }
            </ul>
          ) : (
            <p styleName="farmContractsEmpty">
              <FormattedMessage id="FarmFactoryContractsEmpty" defaultMessage="No contracts deployed" />
            </p>
          )}
        </div>
      </section>
    )
  }
}
