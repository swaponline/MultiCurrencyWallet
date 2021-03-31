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
      <div styleName="mm-promo-page">
        <section styleName="how-to-earn">
          <h2 styleName="section-title">Как заработать на атомарных свопах?</h2>
          <p>Станьте маркетмейкером, предоставив свой капитал для обеспечения атомарных свопов.</p>
          <p>Когда пользователи будут совершать обмены, вы будете зарабатывать %. Помимо этого среди всех маркетмейкеров распределяются SWAP токены, которые можно продать или использовать для фарминга еще большей награды заморозив в пуле SWAP/ETH на uniswap.org </p>
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
                Открыть документацию
              </Button>
            </div>
            
            <div styleName="mode">
              <h3 styleName="mode-title"><span styleName="number">3</span> Создайте pool SWAP/ETH токены в uniswap</h3>
              <p>Подходит для продвинутых пользователей.</p>
              <p>Зарабатывайте когда другие продают или покупают SWAP токены</p>
              <p>Получайте дополнительную награду в SWAP токенах заморозив LP токены (см. п4)</p>
             
              Создать пул https://app.uniswap.org/#/add/0x14a52cf6b4f68431bd5d9524e4fcd6f41ce4ade9/ETH
              
            </div>
            
            <div styleName="mode">
              <h3 styleName="mode-title"><span styleName="number">4</span>Получайте дополнительную награду в SWAP токенах заморозив LP токены</h3>
              <p>Тут должна быть форма фарминга</p>
              
            </div>
            
          </div>
        </section>

        <FAQ />

      </div>
    )
  }

}
