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
  const { onClick, error, curState, startPack, handleClick, etcClick } = props
  const coloredIcons = ['btc', 'eth', 'ghost', 'next', 'swap', 'usdt', 'eurs']

  return (
    <div>
      <div>
        <div>
          <Explanation step={1} subHeaderText={subHeaderText1()}>
            {!isWidgetBuild && (
              <Cupture click={etcClick} step={1} />
            )}
          </Explanation>
          <div styleName={`currencyChooserWrapper ${startPack.length < 4 ? "smallArr" : ""}`}>
            {startPack.map(el => {
              const { name, capture } = el

              return (
                <div key={name} styleName={`card ${curState[name] ? 'purpleBorder' : ''}`} onClick={() => handleClick(name)}>
                  <div styleName="logo">
                    {/*
                    //@ts-ignore */}
                    <Coin styleName={`assetsTableIcon ${coloredIcons.includes(name.toLowerCase()) ? name.toLowerCase() : "coinColor"}`} name={name} />
                  </div>
                  <div styleName="listGroup">
                    <li><b>{name}</b></li>
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
