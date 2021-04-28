import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'

import styles from './MarketmakerPromo.scss'
import { feedback, links, constants } from 'helpers'
import Button from 'components/controls/Button/Button'
import Expandable from 'components/ui/Expandable/Expandable'
import FAQ from './FAQ'
import redirectTo from 'helpers/redirectTo'

const isDark = !!localStorage.getItem(constants.localStorage.isDark)

@cssModules(styles, { allowMultiple: true })
export default class MarketmakerPromo extends React.Component<{}, {}> {
  step3and4enabled: boolean = false

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    feedback.marketmaking.entered()
  }

  onSelectBrowser() {
    feedback.marketmaking.selected('browser')
    redirectTo(`${links.marketmaker}/WBTC`)
  }

  onSelectServer() {
    feedback.marketmaking.selected('server')
    window.open('https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/MARKETMAKER.md')
  }

  onSelectPool() {
    feedback.marketmaking.selected('pool')
    window.open('https://app.uniswap.org/#/add/0x14a52cf6b4f68431bd5d9524e4fcd6f41ce4ade9/ETH')
  }

  onSelectFarm() {
    feedback.marketmaking.selected('farm')
    redirectTo(`${links.farm}`)
  }

  render() {
    return (
      <div styleName="mm-promo-page">
        <section styleName="how-to-earn">
          <h2 styleName="section-title">Как заработать на атомарных свопах?</h2>
          <p>Станьте маркетмейкером, предоставив свой капитал для обеспечения атомарных свопов. Когда пользователи будут совершать обмены, вы будете зарабатывать 0.5%. </p>
        </section>
        <section styleName="select-mode">
          <h2 styleName="section-title">Выберите способ</h2>
          <div styleName="modes">
            <div styleName="mode">
              <h3 styleName="mode-title">
                <span styleName="number">①</span>
                &nbsp;&nbsp;
                <span>Маркетмейкер в браузере</span>
              </h3>
              <p>Подходит для того, что бы попробовать.</p>
              <p>Если вы закроете браузер, вы перестанете зарабатывать.</p>
              <Button styleName="mode-button" blue onClick={this.onSelectBrowser}>
                Начать в браузере
              </Button>
            </div>
            <div styleName="mode">
              <h3 styleName="mode-title">
                <span styleName="number">②</span>
                &nbsp;&nbsp;
                <span>Маркетмейкер-сервер</span>
              </h3>
              <p>Подходит для продвинутых пользователей.</p>
              <p>Требуется сервер для разворачивания образа Docker.</p>
              <Button styleName="mode-button" blue onClick={this.onSelectServer}>
                Читать инструкцию
              </Button>
            </div>
            {this.step3and4enabled && (
              <>
                <div styleName="mode">
                  <h3 styleName="mode-title">
                    <span styleName="number">③</span>
                    &nbsp;&nbsp;
                    <span>Создайте uniswap-пул SWAP/ETH</span>
                  </h3>
                  <p>Подходит для продвинутых пользователей.</p>
                  <p>Зарабатывайте когда другие продают или покупают SWAP токены.</p>
                  <Button styleName="mode-button" blue onClick={this.onSelectPool}>
                    Создать пул
                  </Button>
                </div>
                
                <div styleName="mode">
                  <h3 styleName="mode-title">
                    <span styleName="number">④</span>
                    &nbsp;&nbsp;
                    <span>Фарминг</span>
                  </h3>
                  <p>Получайте дополнительную награду в SWAP токенах, заморозив LP токены</p>
                  <Button styleName="mode-button" blue onClick={this.onSelectFarm}>
                    Начать фарминг
                  </Button>
                </div>
              </>
            )}
            
          </div>
        </section>

        <FAQ
          isDark={isDark}
         />

      </div>
    )
  }

}
