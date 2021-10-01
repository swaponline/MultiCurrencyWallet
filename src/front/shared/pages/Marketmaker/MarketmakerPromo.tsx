import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import config from 'app-config'

import styles from './MarketmakerPromo.scss'
import { feedback, links, constants } from 'helpers'
import actions from 'redux/actions'
import Button from 'components/controls/Button/Button'
import Expandable from 'components/ui/Expandable/Expandable'
import FAQ from './FAQ'
import { routing } from 'helpers'

import extensionPromoLight from './images/extensionPromoLight.png'
import extensionPromoDark from './images/extensionPromoDark.png'

const isDark = !!localStorage.getItem(constants.localStorage.isDark)

type ComponentState = {
  userWallets: IUniversalObj[]
  userTokens: string[] | []
}

@cssModules(styles, { allowMultiple: true })
export default class MarketmakerPromo extends React.Component<{}, ComponentState> {
  // step3and4enabled: boolean = false

  constructor(props) {
    super(props)

    const userWallets = actions.core.getWallets()

    this.state = {
      userWallets,
      userTokens: [],
    }
  }

  componentDidMount() {
    const { userWallets } = this.state

    feedback.marketmaking.enteredPromo()

    userWallets.forEach((wallet) => {
      if (wallet.tokenKey) {
        this.setState((state) => ({
          userTokens: [...state.userTokens, wallet.tokenKey],
        }))
      }
    })
  }

  // onSelectBrowser() {
  //   feedback.marketmaking.selected('browser')
  //   if (config.binance) {
  //     routing.redirectTo(`${links.marketmaker}/BTCB`)
  //   } else {
  //     routing.redirectTo(`${links.marketmaker}/WBTC`)
  //   }
  // }

  // onSelectServer() {
  //   feedback.marketmaking.selected('server')
  //   window.open('https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/MARKETMAKER.md')
  // }

  // onSelectPool() {
  //   feedback.marketmaking.selected('pool')
  //   window.open('https://app.uniswap.org/#/add/0x14a52cf6b4f68431bd5d9524e4fcd6f41ce4ade9/ETH')
  // }

  // onSelectFarm() {
  //   feedback.marketmaking.selected('farm')
  //   routing.redirectTo(`${links.farm}`)
  // }

  openChromeStore() {
    feedback.marketmaking.selected('installExtension')
    window.open(links.extension)
  }

  render() {
    const { userTokens } = this.state

    return (
      <div styleName="mm-promo-page">
        <section styleName="promoHeader">
          <h2 styleName="section-title">
            <FormattedMessage
              id="MM_Promo_Title"
              defaultMessage="Earn interest on {utxoTitle}"
              values={{
                utxoTitle: 'Bitcoin'
              }}
            />
          </h2>
          <p styleName="promoDescription">
            <FormattedMessage
              id="MM_Promo_TitleBody"
              defaultMessage="On swap.io users exchange {utxoCoin} for {token} (a token that costs like {utxoCoin}, but works on {Ab_Title}), and vice versa."
              values={{
                utxoCoin: 'BTC',
                token: (config.binance) ? `BTCB` : `WBTC`,
                Ab_Title: (config.binance) ? `Binance Smart Chain` : `Ethereum`,
                link: <a href={links.impermanentLoss} target="_blank">(?)</a>,
              }}
            />
          </p>
        </section>

        <section>
          <h2 styleName="section-title">
            <FormattedMessage
              id="MM_InstallExtentionTitle"
              defaultMessage="Install Chrome extension and start earning today"
            />
          </h2>

          <div styleName="installExtensionBody">
            <img styleName="extensionPromoImg" src={isDark ? extensionPromoDark : extensionPromoLight} alt="extention_promo"/>
            <Button brand onClick={this.openChromeStore}>
              <FormattedMessage
                id="MM_InstallExtentionBtn"
                defaultMessage="Install Chrome Extension"
              />
            </Button>
            <a
              styleName="devVersionLink"
              target="_blank"
              href="https://github.com/swaponline/MultiCurrencyWallet/actions/workflows/chromeExtention.yml"
            >
              <FormattedMessage
                id="MM_InstallDevExtention"
                defaultMessage="Download development version"
              />
            </a>

            {userTokens.length ? (
              <div styleName="pseudLinksWrapper">
                {userTokens.map((token, index) => {
                  if (
                    token.includes('wbtc') ||
                    token.includes('btcb')
                  ) {
                    return (
                      <Link key={index} to={`/marketmaker/${token}`} styleName="pseudLink">
                        {token.toUpperCase()}
                      </Link>
                    )
                  }

                  return null
                })}
              </div>
            ) : null}
          </div>
        </section>


        {/* <section styleName="select-mode">
          <h2 styleName="section-title">
            <FormattedMessage
              id="MM_Choose_Title"
              defaultMessage="Выберите способ"
            />
          </h2>
          <div styleName="modes">
            <div styleName="mode">
              <h3 styleName="mode-title">
                <span styleName="number">①</span>
                &nbsp;&nbsp;
                <span>
                  <FormattedMessage
                    id="MM_Choose_InBrowser_Title"
                    defaultMessage="Маркетмейкер в браузере"
                  />
                </span>
              </h3>
              <p>
                <FormattedMessage
                  id="MM_Choose_InBrowser_Body1"
                  defaultMessage="Подходит для того, что бы попробовать."
                />
              </p>
              <p>
                <FormattedMessage
                  id="MM_Choose_InBrowser_Body2"
                  defaultMessage="Если вы закроете браузер, вы перестанете зарабатывать."
                />
              </p>
              <Button styleName="mode-button" blue onClick={this.onSelectBrowser}>
                <FormattedMessage
                  id="MM_Choose_InBrowser_Button"
                  defaultMessage="Начать в браузере"
                />
              </Button>
            </div>
            <div styleName="mode">
              <h3 styleName="mode-title">
                <span styleName="number">②</span>
                &nbsp;&nbsp;
                <span>
                  <FormattedMessage
                    id="MM_Choose_Server_Title"
                    defaultMessage="Маркетмейкер-сервер"
                  />
                </span>
              </h3>
              <p>
                <FormattedMessage
                  id="MM_Choose_Server_Body1"
                  defaultMessage="Подходит для продвинутых пользователей."
                />
              </p>
              <p>
                <FormattedMessage
                  id="MM_Choose_Server_Body2"
                  defaultMessage="Требуется сервер для разворачивания образа Docker."
                />
              </p>
              <Button styleName="mode-button" blue onClick={this.onSelectServer}>
               <FormattedMessage
                  id="MM_Choose_Server_Button"
                  defaultMessage="Читать инструкцию"
                />
              </Button>
            </div>
            {this.step3and4enabled && (
              <>
                <div styleName="mode">
                  <h3 styleName="mode-title">
                    <span styleName="number">③</span>
                    &nbsp;&nbsp;
                    <span>
                      <FormattedMessage
                        id="MM_Choose_Uniswap_Title"
                        defaultMessage="Создайте uniswap-пул SWAP/ETH"
                      />
                    </span>
                  </h3>
                  <p>
                    <FormattedMessage
                      id="MM_Choose_Uniswap_Body1"
                      defaultMessage="Подходит для продвинутых пользователей."
                    />
                  </p>
                  <p>
                    <FormattedMessage
                      id="MM_Choose_Uniswap_Body2"
                      defaultMessage="Зарабатывайте когда другие продают или покупают SWAP токены."
                    />
                  </p>
                  <Button styleName="mode-button" blue onClick={this.onSelectPool}>
                    <FormattedMessage
                      id="MM_Choose_Uniswap_Button"
                      defaultMessage="Создать пул"
                    />
                  </Button>
                </div>

                <div styleName="mode">
                  <h3 styleName="mode-title">
                    <span styleName="number">④</span>
                    &nbsp;&nbsp;
                    <span>
                      <FormattedMessage
                        id="MM_Choose_Farming_Title"
                        defaultMessage="Фарминг"
                      />
                    </span>
                  </h3>
                  <p>
                    <FormattedMessage
                      id="MM_Choose_Farming_Body1"
                      defaultMessage="Получайте дополнительную награду в SWAP токенах, заморозив LP токены."
                    />
                  </p>
                  <Button styleName="mode-button" blue onClick={this.onSelectFarm}>
                    <FormattedMessage
                      id="MM_Choose_Farming_Button"
                      defaultMessage="Начать фарминг"
                    />
                  </Button>
                </div>
              </>
            )}

          </div>
        </section> */}

        <FAQ />
      </div>
    )
  }

}
