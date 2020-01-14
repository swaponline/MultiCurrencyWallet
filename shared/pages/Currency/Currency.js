import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import { constants, links, getSiteData } from 'helpers'

import { isMobile } from 'react-device-detect'
import { withRouter } from 'react-router'
import actions from 'redux/actions'
import { Helmet } from 'react-helmet'

import { Link, Redirect } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from '../../helpers/locale'

import CSSModules from 'react-css-modules'
import styles from './Currency.scss'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'

import Row from './Row/Row'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'

@injectIntl
@withRouter
@connect(({
  core: { hiddenCoinsList },
  user: { ethData, btcData, ltcData, tokensData, nimData /* usdtOmniData */ } }) => ({
    items: [ethData, btcData, ltcData, ...Object.keys(tokensData).map(k => (tokensData[k])) /* nimData, usdtOmniData */],
    hiddenCoinsList,
  }))
@CSSModules(styles, { allowMultiple: true })
export default class Currency extends Component {


  constructor({ match: { params: { currency } }, items, tokens, history, intl: { locale } }) {
    super()

    const { projectName } = getSiteData()

    this.state = {
      isBalanceFetching: false,
      isBalanceEmpty: true,
      balance: 0,
      projectName
    }

    const item = items.map(item => item.currency.toLowerCase())
    if (!item.includes(currency)) {
      history.push(localisedUrl(locale, `/NotFound`))
    }
  }

  componentDidMount() {
    this.handleReloadBalance()
  }


  getRows = () => {
    let { match: { params: { currency, address } }, items } = this.props
    currency = currency.toLowerCase()

    return constants.tradeTicker
      .filter(ticker => {
        ticker = ticker.split('-')
        return currency === ticker[0].toLowerCase()
          ? ticker[0].toLowerCase() === currency
          : ticker[1].toLowerCase() === currency
      })
      .map(pair => {
        pair = pair.split('-')
        return {
          from: pair[0],
          to: pair[1],
        }
      })
  }

  getCurrencyName = () => this.props.match.params.currency.toLowerCase()
  getCoin = () => [...this.props.items, ...this.props.tokens].find(coin => coin.currency.toLowerCase() === this.getCurrencyName())

  handleReloadBalance = async () => {
    let { match: { params: { currency } } } = this.props
    currency = currency.toLowerCase()

    const balance = await actions[currency].getBalance(currency)

    if (balance > 0) {
      this.setState(() => ({
        isBalanceEmpty: false,
        balance,
      }))
    }

  }

  isInWallet = () => !this.props.hiddenCoinsList.includes(this.getCoin().currency)

  handleInWalletChange = (val) => val ? actions.core.markCoinAsVisible(this.getCoin().currency) :
    actions.core.markCoinAsHidden(this.getCoin().currency)

  handleReceive = () => {
    let { match: { params: { currency } }, items } = this.props
    const itemCurrency = items.filter(item => item.currency.toLowerCase() === currency)[0]
    const { address } = itemCurrency

    currency = currency.toUpperCase()

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
    })
  }

  handleWithdraw = () => {
    let { match: { params: { currency } }, items } = this.props
    const itemCurrency = items.filter(item => item.currency.toLowerCase() === currency)[0]

    // actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      ...itemCurrency,
    })
  }

  render() {
    const { match: { params: { currency } }, items, intl: { locale, formatMessage } } = this.props
    const { isBalanceEmpty, balance } = this.state
    const myCurrency = items.find(item => item.currency === currency.toUpperCase())
    const currencyFullName = myCurrency ? myCurrency.fullName : 'Chosen currency'

    const SeoValues = {
      fullName: currencyFullName,
      tickerName: currency.toUpperCase(),
      project: projectName
    }
    const MetaDescriptionString = formatMessage({
      id: 'CurrencyMetaDescrTag1',
      defaultMessage: 'Find out actual price of {fullName}, its ticker name is ({tickerName}). {project} is the best way to safely store your cryptocurrecy.', // eslint-disable-line
    }, SeoValues)
    const TitleTagString = formatMessage({
      id: 'CurrencyTitleSeo1',
      defaultMessage: '{fullName} ({tickerName}) Price, Description & Exchange Rates. Store & Exchange {fullName} ({tickerName}) Anonymously on {project}.',
    }, SeoValues)

    return (
      <section styleName={isMobile ? 'currencyMobileSection' : 'currencyMediaSection'}>
        <Helmet>
          <title>{TitleTagString}</title>
          <meta
            name="description"
            content={MetaDescriptionString}
          />
        </Helmet>
        <PageHeadline>
          <Fragment>
            <SubTitle>
              <FormattedMessage
                id="CurrencyH1Seo1"
                defaultMessage="{fullName} ({tickerName}) Price & Exchange Rates."
                values={SeoValues}
              />
            </SubTitle>
          </Fragment>
          <div styleName="currencyBalance">
            <FormattedMessage id="Currency101" defaultMessage="Balance: " />
            <span styleName="currencyBalanceValue">{Math.floor(balance * 1e6) / 1e6} {currency.toUpperCase()}</span>
          </div>
          <div style={{ marginTop: '20px', height: '20px' }}>
            <CurrencyButton
              wallet="true"
              onClick={this.handleReceive}
              dataTooltip={{
                id: `currency${currency}`,
                deposit: true,
              }}
            >
              <FormattedMessage id="Row313" defaultMessage="Deposit" />
            </CurrencyButton>
            <CurrencyButton
              wallet="true"
              dataTooltip={{
                isActive: isBalanceEmpty,
                id: `send${currency}`,
              }}
              onClick={this.handleWithdraw}
              disable={isBalanceEmpty}
            >
              <FormattedMessage id="CurrencyWallet100" defaultMessage="Send" />
            </CurrencyButton>
          </div>
        </PageHeadline>
        <Table
          titles={['', '']}
          rows={this.getRows()}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
        <CloseIcon styleName="closeButton" onClick={() => this.props.history.push(localisedUrl(locale, links.home))} data-testid="CloseIcon" />
      </section>
    )
  }
}
