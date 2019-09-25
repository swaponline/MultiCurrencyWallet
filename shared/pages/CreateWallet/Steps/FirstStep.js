import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import reducers from 'redux/core/reducers'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'

import Check from '../colorsIcons/check'
import Explanation from '../Explanation'
import icons from '../images'


const subHeaderText = () => (
  <FormattedMessage
    id="createWalletSubHeader1"
    defaultMessage="Choose the wallets currency"
  />
)

const CreateWallet = (props) => {

  const [border, setBorder] = useState({
    btc: false,
    eth: false,
    usdt: false,
    eurs: false,
    swap: false,
  })
  const coins = [
    { name: 'btc', capture: 'Bitcoin' },
    { name: 'eth', capture: 'Ethereum' },
    { name: 'usdt', capture: 'Stablecoin' },
    { name: 'swap', capture: 'Swap' },
  ]

  const handleClick = name => {
    const dataToReturn = { ...border, [name]: !border[name]  }
    setBorder(dataToReturn)
    reducers.createWallet.newWalletData({ type: 'currencies', data: dataToReturn })
  }

  return (
    <div>
      <Explanation subHeaderText={subHeaderText()}>
        <FormattedMessage
          id="createWalletCapture1"
          defaultMessage="To choose Bitcoin, Ethereum, USDT, EUROS, Swap  or all at once"
        />
      </Explanation>
      <div styleName="currencyChooserWrapper">
        {coins.map(el => {
          const { name, capture } = el
          return (
            <div styleName={`card ${border[name] ? 'purpleBorder' : ''}`} onClick={() => handleClick(name)}>
              <img
                styleName={`logo ${name}`}
                src={icons[name]}
                alt={`${name} icon`}
                role="image"
              />
              <div styleName='listGroup'>
                <li><b>{name.toUpperCase()}</b></li>
                <li>{capture}</li>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default CSSModules(CreateWallet, styles, { allowMultiple: true })
