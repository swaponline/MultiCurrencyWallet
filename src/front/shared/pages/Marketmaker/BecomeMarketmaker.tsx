import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'

import styles from './BecomeMarketmaker.scss'
import { feedback } from 'helpers'
import Button from 'components/controls/Button/Button'
import Expandable from 'components/ui/Expandable/Expandable'
import FAQ from './FAQ'


@cssModules(styles, { allowMultiple: true })
export default class BecomeMarketmaker extends React.Component<{}, {}> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    //feedback.marketmakerPromo.entered()
  }

  onSelectBrowser() {
    //feedback.marketmakerPromo.selected('browser')
  }

  onSelectServer() {
    //feedback.marketmaker.selected('server')
    window.open('https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/MARKETMAKER.md')
  }

  render() {
    return (
      <>
        <section styleName="how-to-earn">
          <h2 styleName="section-title">Как заработать на атомарных свопах?</h2>
          <p>Станьте маркетмейкером, предоставив свой капитал для обеспечения атомарных свопов.</p>
          <p>Когда пользователи будут совершать обмены, вы будете зарабатывать.</p>
        </section>
        <section styleName="select-mode">
          <h2 styleName="section-title">Выберите способ</h2>
          <div styleName="modes">
            <div styleName="mode">
              <h3 styleName="mode-title"><span styleName="number">①</span> Маркетмейкер в браузере</h3>
              <p>Подходит для того, что бы попробовать.</p>
              <p>Если вы закроете браузер, вы перестанете зарабатывать.</p>
              <Button styleName="mode-button" blue onClick={this.onSelectBrowser}>
                Начать в браузере
              </Button>
            </div>
            <div styleName="mode">
              <h3 styleName="mode-title"><span styleName="number">②</span> Маркетмейкер-сервер</h3>
              <p>Подходит для продвинутых пользователей.</p>
              <p>Требуется сервер для разворачивания образа Docker.</p>
              <Button styleName="mode-button" blue onClick={this.onSelectServer}>
                Настроить сервер
              </Button>
            </div>
          </div>
        </section>

        <FAQ />

        <section styleName="marketmaker-settings">
          <h2 styleName="section-title">Настройки маркетмейкинга</h2>
  {/*        Маркетмейкинг BTC/WBTC : вкл/выкл
  Спред: 0.5% (по умолчанию стоит 0.5%)
  Баланс BTC: 2 BTC для пополнения переведите на `адрес битка`
  Баланс WBTC: 2 WBTC


  Маркетмейкеров онлайн: 10. Всего ордеров: 10 btc, 5 wbtc.*/}
        </section>
      </>
    )
  }

}