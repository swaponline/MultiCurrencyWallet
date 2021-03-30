import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'

import styles from './MarketmakerPromo.scss'
import { feedback, links } from 'helpers'
import Button from 'components/controls/Button/Button'
import Expandable from 'components/ui/Expandable/Expandable'
import FAQ from './FAQ'
import redirectTo from 'helpers/redirectTo'


@cssModules(styles, { allowMultiple: true })
export default class MarketmakerPromo extends React.Component<{}, {}> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    feedback.marketmaking.entered()
  }

  onSelectBrowser() {
    console.log('onSelectBrowser')
    feedback.marketmaking.selected('browser')
    redirectTo(`${links.marketmaker}/BTC-WBTC`)
  }

  onSelectServer() {
    feedback.marketmaking.selected('server')
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

      </>
    )
  }

}