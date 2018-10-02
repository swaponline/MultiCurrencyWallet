import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cssModules from 'react-css-modules'

import actions from 'redux/actions'
import { connect } from 'redaction'
import { links } from 'helpers'

import CurrencyDirectionChooser from 'components/CurrencyDirectionChooser/CurrencyDirectionChooser'
import PageHeadline from 'components/PageHeadline/PageHeadline'

import Orders from './Orders/Orders'
import SubTitle from '../../components/PageHeadline/SubTitle/SubTitle'
import styles from './Home.scss'
import Center from '../../components/layout/Center/Center'
import { FaqExpandableItem } from '../../components/FaqExpandableItem/FaqExpandableItem'


@connect(({ core: { filter }, currencies: { items: currencies }, info: { faqList } }) => ({
  filter,
  currencies,
  faqList,
}))
@cssModules(styles)
export default class Home extends Component {

  static propTypes = {
    faqList: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })),
  }

  constructor({ initialData, match: { params: { buy, sell } } }) {
    super()

    const { buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      buyCurrency: buy || buyCurrency || 'swap',
      sellCurrency: sell || sellCurrency || 'btc',
    }
  }

  componentDidMount() {
    actions.info.getFaq()
  }

  componentWillMount() {
    const { match: { params: { buy, sell } } } = this.props

    if (buy !== this.state.sellCurrency || sell !== this.state.sellCurrency) {
      actions.core.setFilter(`${sell}-${buy}`)
    }
  }

  handleBuyCurrencySelect = ({ value }) => {
    const { sellCurrency, buyCurrency } = this.state

    this.setState({
      buyCurrency: value,
      sellCurrency: value === buyCurrency ? buyCurrency : sellCurrency,
    })
  }

  handleSellCurrencySelect = ({ value }) => {
    const { sellCurrency, buyCurrency } = this.state

    this.setState({
      buyCurrency: value === buyCurrency ? sellCurrency : buyCurrency,
      sellCurrency: value,
    })
  }

  flipCurrency = () => {
    const { buyCurrency, sellCurrency } = this.state

    this.setState({
      buyCurrency: sellCurrency,
      sellCurrency: buyCurrency,
    })
  }

  setFilter = (filter) => {
    actions.core.setFilter(filter)
  }

  handleNext = () => {
    const { history } = this.props
    const { buyCurrency, sellCurrency } = this.state

    this.setFilter(`${buyCurrency}-${sellCurrency}`)
    history.replace((`${links.home}${buyCurrency}-${sellCurrency}`))
  }

  render() {
    const {
      match: {
        params: {
          orderId,
        },
      },
      history: {
        location: {
          pathname,
        },
      },
      currencies,
      faqList,
    } = this.props

    const { buyCurrency, sellCurrency } = this.state

    return (
      <section style={{ position: 'relative', width: '100%' }}>
        <PageHeadline>
          {
            pathname === links.exchange ?
              <React.Fragment>
                <CurrencyDirectionChooser
                  handleSellCurrencySelect={this.handleSellCurrencySelect}
                  handleBuyCurrencySelect={this.handleBuyCurrencySelect}
                  handleSubmit={this.handleNext}
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

                    <div styleName="faqContainer">
                      {
                        Boolean(faqList && faqList.length) &&
                        faqList.map((question, idx) => <FaqExpandableItem key={idx} {...question} />)
                      }
                    </div>
                  </div>
                </div>
              </React.Fragment>
              :
              <Orders
                handleSellCurrencySelect={this.handleSellCurrencySelect}
                handleBuyCurrencySelect={this.handleBuyCurrencySelect}
                buyCurrency={buyCurrency}
                sellCurrency={sellCurrency}
                flipCurrency={this.flipCurrency}
                orderId={orderId}
              />
          }
        </PageHeadline>
      </section>
    )
  }
}
