import React, { Component } from 'react'

import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import reducers from 'redux/core/reducers'
import { isMobile } from 'react-device-detect'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'
import Coin from 'components/Coin/Coin'

import Explanation from '../Explanation'
import icons from '../images'

import {
  subHeaderText1,
  cupture1,
  subHeaderText2,
  cupture2,
} from './texts'


@connect(({
  user: {
    ethData,
    btcData,
    btcMultisigSMSData,
    btcMultisigUserData,
    bchData,
    tokensData,
    eosData,
    telosData,
    ltcData,
    // qtumData,
    // usdtOmniData,
    // nimData,
    // xlmData,
  },
  currencies: { items: currencies },
}, { currency }) => ({
  items: [
    btcData,
    btcMultisigSMSData,
    btcMultisigUserData,
    ethData,
    eosData,
    telosData,
    bchData,
    ltcData,
    //qtumData,
    // xlmData,
    // usdtOmniData,
    ...Object.keys(tokensData).map(k => (tokensData[k])),
  ]
    .map(({ account, keyPair, ...data }) => ({
      ...data,
    }))
}))
@CSSModules(styles, { allowMultiple: true })
export default class CreateWallet extends Component {

  constructor(props) {
    super()
    const { items } = props

    const coins = items.map(({ currency, fullName }) => ({ name: currency.toLowerCase(), capture: fullName }))
    const curState = {}
    items.forEach(({ currency }) => { curState[currency] = false })


    this.state = {
      curState,
      coins
    }
  }


  handleClick = name => {
    const { setError } = this.props
    const { curState } = this.state

    const dataToReturn = { ...curState, [name]: !curState[name] }
    this.setState(() => ({ curState: dataToReturn }))
    reducers.createWallet.newWalletData({ type: 'currencies', data: dataToReturn })
    setError(null)
  }

  render() {
    const { onClick, error } = this.props
    const { coins, curState } = this.state

    return (
      <div>
        <div>
          <div>
            <Explanation step={1} subHeaderText={subHeaderText1()}>
              {cupture1()}
            </Explanation>
            <div styleName="currencyChooserWrapper">
              {coins.map(el => {
                const { name, capture } = el
                return (
                  <div key={name} styleName={`card ${curState[name] ? 'purpleBorder' : ''}`} onClick={() => this.handleClick(name)}>
                    <div styleName={`logo coinColor`}>
                      <Coin styleName="assetsTableIcon" name={name} />
                    </div>
                    <div styleName="listGroup">
                      <li><b>{name.toUpperCase()}</b></li>
                      <li>{capture}</li>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <button styleName="continue" onClick={onClick} disabled={error}>
            <FormattedMessage id="createWalletButton1" defaultMessage="Продолжить" />
          </button>
        </div>
        {!isMobile &&
          <div>
            <Explanation step={2} subHeaderText={subHeaderText2()} notMain>
              {cupture2()}
            </Explanation>
          </div>
        }
      </div>
    )
  }

}
