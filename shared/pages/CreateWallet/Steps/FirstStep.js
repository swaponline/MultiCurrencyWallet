import React, { useState } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import reducers from 'redux/core/reducers'
import { isMobile } from 'react-device-detect'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'

import Explanation from '../Explanation'
import icons from '../images'

import {
  subHeaderText1,
  cupture1,
  subHeaderText2,
  cupture2,
} from './texts'


const CreateWallet = ({ onClick, error, setError }) => {

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
    { name: 'bch', capture: 'Bitcoin Cash' },
  ]

  const handleClick = name => {

    const dataToReturn = { ...border, [name]: !border[name] }
    setBorder(dataToReturn)
    reducers.createWallet.newWalletData({ type: 'currencies', data: dataToReturn })
    setError(null)
  }

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
                <div styleName={`card ${border[name] ? 'purpleBorder' : ''}`} onClick={() => handleClick(name)}>
                  <div styleName={`logo ${name}`}>
                    <img
                      src={icons[name]}
                      alt={`${name} icon`}
                      role="image"
                    />
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
export default CSSModules(CreateWallet, styles, { allowMultiple: true })
