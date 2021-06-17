import React, { useState, ReactNode } from 'react'
import cssModules from 'react-css-modules'
import { connect } from 'redaction'
import { constants } from 'helpers'
import { user } from 'helpers'
import config from 'app-config'
import actions from 'redux/actions'
import { FormattedMessage } from 'react-intl'
import { isMobile } from 'react-device-detect'

import cx from 'classnames'

import Button from 'components/controls/Button/Button'
import FAQ from 'components/FAQ/FAQ'
import { ModalConductorProvider } from 'components/modal'

import styles from './styles.scss'

const isWidgetBuild = config && config.isWidget
const isDark = localStorage.getItem(constants.localStorage.isDark)

type NewDesignLayoutProps = {
  hiddenCoinsList: string[]
  activeFiat: string
  page: 'history' | 'invoices'
  children?: ReactNode
  BalanceForm: ReactNode
}

const NewDesignLayout = (props: NewDesignLayoutProps) => {
  const { hiddenCoinsList, activeFiat, children, page } = props

  const balanceRef = React.useRef(null) // Create a ref object

  let activeView = 0

  if (page === 'history' && !isMobile) {
    activeView = 1
  }
  if (page === 'invoices') activeView = 2

  const isSweepReady = localStorage.getItem(constants.localStorage.isSweepReady)
  const isBtcSweeped = actions.btc.isSweeped()
  const isEthSweeped = actions.eth.isSweeped()

  let showSweepBanner = !isSweepReady

  if (isBtcSweeped || isEthSweeped) showSweepBanner = false

  const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

  const [commonState, setCommonState] = useState({
    activeView,
    activePage: page,
    btcBalance: 0,
    activeCurrency: activeFiat.toLowerCase(),
    walletTitle: 'Wallet',
    editTitle: false,
    enabledCurrencies: user.getActivatedCurrencies(),
    showSweepBanner,
    isMnemonicSaved: mnemonic === `-`,
  })

  const { enabledCurrencies } = commonState

  let btcBalance = 0
  let fiatBalance = 0
  let changePercent = 0

  const allData = actions.core.getWallets({})
  const widgetCurrencies = user.getWidgetCurrencies()

  let tableRows = allData.filter(
    ({ currency, address, balance }) =>
      // @ToDo - В будущем нужно убрать проверку только по типу монеты.
      // Старую проверку оставил, чтобы у старых пользователей не вывалились скрытые кошельки

      (!hiddenCoinsList.includes(currency) &&
        !hiddenCoinsList.includes(`${currency}:${address}`)) ||
      balance > 0
  )

  if (isWidgetBuild) {
    // tableRows = allData.filter(({ currency }) => widgetCurrencies.includes(currency))
    tableRows = allData.filter(
      ({ currency, address }) =>
        !hiddenCoinsList.includes(currency) && !hiddenCoinsList.includes(`${currency}:${address}`)
    )
    // Отфильтруем валюты, исключив те, которые не используются в этом билде
    tableRows = tableRows.filter(({ currency }) => widgetCurrencies.includes(currency))
  }

  //@ts-ignore: strictNullChecks
  tableRows = tableRows.filter(({ currency }) => enabledCurrencies.includes(currency))

  tableRows.forEach(({ name, infoAboutCurrency, balance, currency }) => {
    const currName = currency || name

    if (
      (!isWidgetBuild || widgetCurrencies.includes(currName)) &&
      infoAboutCurrency &&
      balance !== 0
    ) {
      if (currName === 'BTC') {
        changePercent = infoAboutCurrency.percent_change_1h
      }
      btcBalance += balance * infoAboutCurrency.price_btc
      fiatBalance += balance * (infoAboutCurrency.price_fiat ? infoAboutCurrency.price_fiat : 1)
    }
  })

  return (
    <article className="data-tut-start-widget-tour">
      {window.CUSTOM_LOGO && <img className="cutomLogo" src={window.CUSTOM_LOGO} alt="logo" />}
      <section
        styleName={`wallet ${window.CUSTOM_LOGO ? 'hasCusomLogo' : ''} ${isDark ? 'dark' : ''}`}
      >
        <div className="data-tut-store" styleName="walletContent" ref={balanceRef}>
          <div styleName="walletBalance">
            {props.BalanceForm}

            <div
              className={cx({
                [styles.desktopEnabledViewForFaq]: true,
                [styles.faqWrapper]: true,
              })}
            >
              <FAQ />
            </div>
          </div>
          <div
            styleName={cx({
              yourAssetsWrapper: activeView === 0,
              activity: activeView === 1 || activeView === 2,
              active: true,
            })}
          >
            {showSweepBanner && (
              <p styleName="sweepInfo">
                <Button blue /*onClick={this.handleMakeSweep}*/>
                  <FormattedMessage id="SweepBannerButton" defaultMessage="Done" />
                </Button>
                <FormattedMessage
                  id="SweepBannerDescription"
                  defaultMessage={`Пожалуйста, переместите все средства на кошельки помеченные "new" 
                      (USDT и остальные токены переведите на Ethereum (new) адрес). 
                      Затем нажмите кнопку "DONE". Старые адреса будут скрыты.`}
                />
              </p>
            )}

            <ModalConductorProvider>{children}</ModalConductorProvider>
          </div>
          <div
            className={cx({
              [styles.mobileEnabledViewForFaq]: true,
              [styles.faqWrapper]: true,
            })}
          >
            <FAQ />
          </div>
        </div>
      </section>
    </article>
  )
}

export default connect(
  ({
    core: { hiddenCoinsList },
    user: {
      activeFiat,
    },
  }) => {
    let widgetMultiTokens = []
    if (window?.widgetEvmLikeTokens?.length) {
      window.widgetEvmLikeTokens.forEach((token) => {
        //@ts-ignore: strictNullChecks
        widgetMultiTokens.push(token.name.toUpperCase())
      })
    }

    return {
      hiddenCoinsList,
      activeFiat,
    }
  }
)(cssModules(NewDesignLayout, styles, { allowMultiple: true }))
