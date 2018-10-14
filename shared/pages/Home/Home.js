import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Home.scss'

import { links, constants } from 'helpers'

import actions from 'redux/actions'
import { connect } from 'redaction'

import Center from 'components/layout/Center/Center'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import FaqExpandableItem from 'components/FaqExpandableItem/FaqExpandableItem'
import CurrencyDirectionChooser from 'components/CurrencyDirectionChooser/CurrencyDirectionChooser'

import Orders from './Orders/Orders'


@connect(({
  core: { filter },
  currencies: { items: currencies },
}) => ({
  filter,
  currencies,
}))
@cssModules(styles, { allowMultiple: true })
export default class Home extends Component {

  static propTypes = {
    faqList: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })),
    faqFetching: PropTypes.bool,
  }

  constructor({ initialData, match: { params: { buy, sell } } }) {
    super()

    const { buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      buyCurrency: buy || buyCurrency || 'swap',
      sellCurrency: sell || sellCurrency || 'btc',
      invalidPair: false,
    }
  }

  componentWillMount() {
    const { match: { params: { buy, sell } } } = this.props

    if (!sell || !buy) {
      return
    }

    this.checkPair(sell, buy)
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
    sell  = sell.toUpperCase()
    buy   = buy.toUpperCase()

    if (constants.tradeTicker.includes(`${sell}-${buy}`)) {
      this.setFilter(`${sell}-${buy}`)
    } else if (constants.tradeTicker.includes(`${buy}-${sell}`)) {
      this.setFilter(`${buy}-${sell}`)
    } else {
      this.setFilter('swap-btc')
      this.setState(() => ({
        sellCurrency: 'btc',
        buyCurrency: 'swap',
        invalidPair: true,
      }))
    }
  }

  handleShowOrders = () => {
    const { history, filter } = this.props

    this.setState(() => ({ isVisible: false }))
    history.replace(filter)
  }

  render() {
    const { match: { params: { orderId } }, history: { location: { pathname } }, currencies, history, filter } = this.props
    const { buyCurrency, sellCurrency, invalidPair } = this.state

    return (
      <section style={{ position: 'relative', width: '100%' }}>
        <PageHeadline>
          {
            pathname === links.exchange ? (
              <Fragment>
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
                    <SubTitle>What is atomic swap?</SubTitle>
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
                    <div styleName="faqContainer" >
                      {
                        links.faq.map((question, idx) =>
                          <FaqExpandableItem key={idx} {...question} />
                        )
                      }
                    </div>
                  </div>
                </div>
              </Fragment>
            ) : (
              <Orders
                handleSellCurrencySelect={this.handleSellCurrencySelect}
                handleBuyCurrencySelect={this.handleBuyCurrencySelect}
                buyCurrency={buyCurrency}
                sellCurrency={sellCurrency}
                flipCurrency={this.flipCurrency}
                orderId={orderId}
                history={history}
                filter={filter}
                invalidPair={invalidPair}
              />
            )
          }
        </PageHeadline>
      </section>
    )
  }
}
