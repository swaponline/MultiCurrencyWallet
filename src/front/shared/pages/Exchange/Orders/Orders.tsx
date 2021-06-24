import React, { Component, Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './Orders.scss'

import { links, constants } from 'helpers'

import actions from 'redux/actions'
import { connect } from 'redaction'
import { isMobile } from 'react-device-detect'

import Center from 'components/layout/Center/Center'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import FaqExpandableItem from 'components/FaqExpandableItem/FaqExpandableItem'
import CurrencyDirectionChooser from 'components/CurrencyDirectionChooser/CurrencyDirectionChooser'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'

import OrderBook from './OrderBook/OrderBook'

import config from 'app-config'


@connect(({
  core: { filter },
  currencies: { items: currencies },
}) => ({
  filter,
  currencies,
}))
@cssModules(styles, { allowMultiple: true })
class Offers extends Component<any, any> {
  constructor(props) {
    super(props)
    const { initialData, intl: { locale } } = props
    const { buyCurrency, sellCurrency } = initialData || {}

    const { buy, sell } = this.getCurrentCurrencies(props)

    this.state = {
      buyCurrency: buy || buyCurrency || 'swap',
      sellCurrency: sell || sellCurrency || 'btc',
      invalidPair: false,
      isShow: false,
      exchange: localisedUrl(locale, links.exchange),
    }
  }

  componentDidMount() {
    const { buy, sell } = this.getCurrentCurrencies(this.props)

    if (!sell || !buy) {
      return
    }

    this.checkPair(sell, buy)
  }

  componentDidUpdate({ buy: prevBuy, sell: prevSell }) {
    const { buy, sell } = this.props
    if (buy !== prevBuy || sell !== prevSell) {
      this.createNewState({
        buyCurrency: buy,
        sellCurrency: sell,
      })
    }
  }

  createNewState = ({ buyCurrency, sellCurrency }) => {
    this.checkPair(sellCurrency, buyCurrency)

    this.setState(() => ({ buyCurrency, sellCurrency }))
  }

  getCurrentCurrencies = (props) => {
    const { match = {}, buy: buyCurrency, sell: sellCurrency } = props

    const buy = match.params ? match.params.buy : buyCurrency
    const sell = match.params ? match.params.sell : sellCurrency

    return { buy, sell }
  }

  handleBuyCurrencySelect = ({ value }) => {
    let { sellCurrency, buyCurrency } = this.state

    if (sellCurrency === value) {
      sellCurrency = buyCurrency
    }

    this.checkPair(sellCurrency, value)

    this.setState({
      buyCurrency: value,
      sellCurrency,
    })
  }

  handleSellCurrencySelect = ({ value }) => {
    let { sellCurrency, buyCurrency } = this.state

    if (buyCurrency === value) {
      buyCurrency = sellCurrency
    }

    this.checkPair(value, buyCurrency)
    actions.pairs.selectPair(sellCurrency)
    this.setState({
      buyCurrency,
      sellCurrency: value,
    })
  }

  flipCurrency = () => {
    const { buyCurrency, sellCurrency } = this.state

    this.checkPair(buyCurrency, sellCurrency)

    this.setState({
      buyCurrency: sellCurrency,
      sellCurrency: buyCurrency,
    })
  }

  setFilter = (filter) => {
    actions.core.setFilter(filter)
  }

  checkPair = (sell, buy) => {
    sell = sell.toUpperCase()
    buy = buy.toUpperCase()

    if (constants.tradeTicker.includes(`${sell}-${buy}`)) {
      this.setFilter(`${sell}-${buy}`)
    } else if (constants.tradeTicker.includes(`${buy}-${sell}`)) {
      this.setFilter(`${buy}-${sell}`)
    } else {
      this.setFilter('usdt-btc')
      this.setState(() => ({
        sellCurrency: 'btc',
        buyCurrency: 'usdt',
        invalidPair: true,
      }))
    }
  }

  handleShowOrders = () => {
    const { history, filter } = this.props

    this.setState(() => ({
      isVisible: false,
      isShow: true,
    }))
    history.replace(filter.toLowerCase())
  }

  render() {
    const { match = {}, history = {}, currencies, linkedOrderId } = this.props
    const { buyCurrency, sellCurrency, invalidPair, exchange } = this.state
    const sectionContainerStyleName = isMobile ? 'sectionContainerMobile' : 'sectionContainer'
    const isWidgetBuild = config && config.isWidget

    const {
      pairFees,
      balances,
    } = this.props

    return (
      <section styleName={isWidgetBuild ? `${sectionContainerStyleName} ${sectionContainerStyleName}_widget` : sectionContainerStyleName}>
        {
          history.location && history.location.pathname === exchange ? (
            //@ts-ignore
            <PageHeadline>
              <CurrencyDirectionChooser
                handleSellCurrencySelect={this.handleSellCurrencySelect}
                handleBuyCurrencySelect={this.handleBuyCurrencySelect}
                handleSubmit={this.handleShowOrders}
                buyCurrency={buyCurrency}
                sellCurrency={sellCurrency}
                flipCurrency={this.flipCurrency}
                currencies={currencies}
              />
              <div styleName="videoContainer">
                <Center relative centerVertically={false}>
                  <SubTitle>
                    <FormattedMessage id="Home153" defaultMessage="What is atomic swap?" />
                  </SubTitle>
                </Center>

                <div styleName="videoFaqContainer">
                  <iframe
                    title="What is atomic swap?"
                    width="700"
                    height="480"
                    src="https://www.youtube.com/embed/Jhrb7xOT_7s"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                  <div styleName="faqContainer">
                    {
                      links.faq.map((question, idx) =>
                        <FaqExpandableItem key={idx} {...question} />
                      )
                    }
                  </div>
                </div>
              </div>
            </PageHeadline>
          ) : (
            <OrderBook
              handleSellCurrencySelect={this.handleSellCurrencySelect}
              handleBuyCurrencySelect={this.handleBuyCurrencySelect}
              buyCurrency={buyCurrency}
              sellCurrency={sellCurrency}
              flipCurrency={this.flipCurrency}
              orderId={match.params && match.params.orderId}
              invalidPair={invalidPair}
              linkedOrderId={linkedOrderId}
              pairFees={pairFees}
              balances={balances}
              checkSwapAllow={this.props.checkSwapAllow}
              checkSwapExists={this.props.checkSwapExists}
            />
          )
        }
      </section>
    )
  }
}

export default injectIntl(Offers)
