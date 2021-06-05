import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../CreateWallet.scss'

import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'
import Coin from 'components/Coin/Coin'

import Explanation from '../Explanation'
import config from 'helpers/externalConfig'

import Cupture, {
  subHeaderText1,
  subHeaderText2,
  cupture2,
} from './texts'

const isWidgetBuild = config && config.isWidget


function FirstStep(props) {
  const { onClick, error, curState, startPack, handleClick } = props
  const coloredIcons = ['btc', 'eth', 'bnb', 'ghost', 'next', 'swap', 'usdt', 'eurs']

  return (
    <div>
      <div>
        <div>
          <Explanation step={1} subHeaderText={subHeaderText1()}>
            {!isWidgetBuild && (
              <Cupture />
            )}
          </Explanation>
          <div styleName={`currencyChooserWrapper ${startPack.length < 4 ? "smallArr" : ""}`}>
            {startPack.map((el, index) => {
              const { name, capture, baseChain } = el

              return (
                <div id={`${name.toLowerCase()}Wallet`} key={index} styleName={`card ${curState[name] ? 'purpleBorder' : ''}`} onClick={() => handleClick(name)}>
                  <div styleName="logo">
                    <Coin
                      name={name}
                      styleName={`assetsTableIcon ${coloredIcons.includes(name.toLowerCase())
                        ? name.toLowerCase()
                        : "coinColor"}`
                      }
                    />
                  </div>
                  <div styleName="listGroup">
                    <li><b>{name}</b></li>
                    <li>{baseChain && `(${baseChain})`} {capture}</li>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <button id='continueBtn' styleName="continue" onClick={onClick} disabled={error}>
          <FormattedMessage id="createWalletButton1" defaultMessage="Продолжить" />
        </button>
      </div>
      {
        !isMobile &&
        <div>
          <Explanation step={2} subHeaderText={subHeaderText2()} notMain>
            {cupture2()}
          </Explanation>
        </div>
      }
    </div>
  )
}

export default CSSModules(FirstStep, styles, { allowMultiple: true })
