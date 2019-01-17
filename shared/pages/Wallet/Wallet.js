import React, { Component } from 'react'
import propTypes from 'prop-types'

import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'
import { withRouter } from 'react-router'

import CSSModules from 'react-css-modules'
import stylesWallet from './Wallet.scss'

import Row from './Row/Row'
import Table from 'components/tables/Table/Table'
import { WithdrawButton } from 'components/controls'
import styles from 'components/tables/Table/Table.scss'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import PageSeo from 'components/Seo/PageSeo'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import KeyActionsPanel from 'components/KeyActionsPanel/KeyActionsPanel'
import SaveKeysModal from 'components/modals/SaveKeysModal/SaveKeysModal'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import config from 'app-config'


@connect(
  ({
    core: { hiddenCoinsList },
    user: { ethData, btcData, tokensData, eosData, xlmData, telosData, nimData, usdtData, ltcData },
    currencies: { items: currencies },
  }) => ({
    tokens: ((config && config.isWidget) ?
      [ config.erc20token.toUpperCase() ]
      :
      Object.keys(tokensData).map(k => (tokensData[k].currency))
    ),
    items: ((config && config.isWidget) ?
      [btcData, ethData, usdtData ]
      :
      [btcData, ethData, eosData, telosData, xlmData, ltcData, usdtData /* nimData */ ]).map((data) => (
      data.currency
    )),
    currencyBalance: [btcData, ethData, eosData, xlmData, telosData, ltcData, usdtData, ...Object.keys(tokensData).map(k => (tokensData[k])) /* nimData */ ].map((cur) => (
      cur.balance
    )),
    currencies,
    hiddenCoinsList : (config && config.isWidget) ? [] : hiddenCoinsList,
  })
)
@injectIntl
@withRouter
@CSSModules(stylesWallet, { allowMultiple: true })
export default class Wallet extends Component {

  static propTypes = {
    core: propTypes.object,
    user: propTypes.object,
    currencies: propTypes.array,
    hiddenCoinsList: propTypes.array,
    history: propTypes.object,
    items: propTypes.arrayOf(propTypes.string),
    tokens: propTypes.arrayOf(propTypes.string),
    location: propTypes.object,
    intl: propTypes.object.isRequired,
    match: propTypes.object,
  }

  state = {
    saveKeys: false,
    openModal: false,
  }

  componentWillMount() {
    actions.user.getBalances()
    actions.analytics.dataEvent('open-page-balances')

    if (process.env.MAINNET) {
      localStorage.setItem(constants.localStorage.testnetSkip, false)
    } else {
      localStorage.setItem(constants.localStorage.testnetSkip, true)
    }

    const testSkip = JSON.parse(localStorage.getItem(constants.localStorage.testnetSkip))
    const saveKeys = JSON.parse(localStorage.getItem(constants.localStorage.privateKeysSaved))

    this.setState(() => ({
      testSkip,
      saveKeys,
    }))
  }

  componentWillReceiveProps() {
    const { saveKeys, testSkip } = this.state

    const openTour = JSON.parse(localStorage.getItem(constants.localStorage.openTour))

    if (saveKeys || testSkip || !openTour) {
      return
    }
  }

  componentDidUpdate() {
    const { openModal } = this.state

    const { currencyBalance } = this.props

    if (!localStorage.getItem(constants.localStorage.wasCautionShow) && process.env.MAINNET) {
      currencyBalance.forEach(cur => {
        if (cur > 0) {
          actions.modals.open(constants.modals.PrivateKeys, {})
          localStorage.setItem(constants.localStorage.wasCautionShow, true)
        }
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const getComparableProps = (props) => ({
      items: props.items,
      currencyBalance: props.currencyBalance,
      tokens: props.tokens,
      currencies: props.currencies,
      hiddenCoinsList: props.hiddenCoinsList,
    })
    return JSON.stringify({
      ...getComparableProps(this.props),
      ...this.state,
    }) !== JSON.stringify({
      ...getComparableProps(nextProps),
      ...nextState,
    })
  }

  render() {
    const { items, tokens, currencies, hiddenCoinsList, intl, location } = this.props

    const titles = [
      <FormattedMessage id="Wallet114" defaultMessage="Coin" />,
      <FormattedMessage id="Wallet115" defaultMessage="Name" />,
      <FormattedMessage id="Wallet116" defaultMessage="Balance" />,
      <FormattedMessage id="Wallet117" defaultMessage="Your Address" />,
      isMobile ?
        <FormattedMessage id="Wallet118" defaultMessage="Send, receive, swap" />
        :
        <FormattedMessage id="Wallet119" defaultMessage="Actions" />,
    ]
    const title = defineMessages({
      metaTitle: {
        id: 'Wallet140',
        defaultMessage: 'Swap.Online - Cryptocurrency Wallet with Atomic Swap Exchange',
      },
    })
    const description = defineMessages({
      metaDescription: {
        id: 'Wallet146',
        defaultMessage: `Our online wallet with Atomic swap algorithms will help you store and exchange cryptocurrency instantly
        and more secure without third-parties. Decentralized exchange.`,
      },
    })

    return (
      <section styleName={isMobile ? 'sectionWalletMobile' : 'sectionWallet'}>
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(title.metaTitle)}
          defaultDescription={intl.formatMessage(description.metaDescription)} />
        <PageHeadline styleName="pageLine">
          <SubTitle>
            <FormattedMessage id="Wallet104" defaultMessage="Your online cryptocurrency wallet" />
          </SubTitle>
        </PageHeadline>
        <KeyActionsPanel />
        <div styleName="depositText">
          <FormattedMessage id="Wallet137" defaultMessage="Deposit funds to addresses below" />
        </div>
        <Table
          id="table-wallet"
          className={styles.wallet}
          titles={titles}
          rows={[...items, ...tokens].filter(currency => !hiddenCoinsList.includes(currency))}
          rowRender={(row, index, selectId, handleSelectId) => (
            <Row key={row} currency={row} currencies={currencies} hiddenCoinsList={hiddenCoinsList} selectId={selectId} index={index} handleSelectId={handleSelectId} />
          )}
        />
        {
          (config && !config.isWidget) && (
            <div styleName="inform">
            <FormattedMessage
              id="Wallet156"
              defaultMessage="Welcome to the Swap.Online, decentralized cross-chain wallet based on the Atomic Swap technology.
                Here you can promptly and safely store and exchange Bitcoin, Ethereum, EOS, USD Tether, BCH and numerous ERC-20 tokens.
                Swap.Online doesn’t store your keys or your tokens. Our wallet operates directly in browser, so, no additional installations or downloads are required.
                Swap.Online service is fully decentralized as all the operations with tokens are executed via the IPFS network.
                It was our team that finalized first Atomic Swaps with USDT and EOS in September, 2018. Also, the Litecoin blockchain was added in October, 2018.
                Thus, our wallet addresses real multi-chain integration with decentralized orderbook, no third party involved in the exchange, no proxy-token and no token wrapping.
                As for now, seeking for the liquidity, we can integrate every ERC-20 token for free just in case of mutual PR-announcement with the project the token is backed by.
                Also, we designed Swap.Button, b2b-solution to exchange all kinds of tokens on Bitcoin and Ethereum.
                Just install this widget on your site and collect crypto investments to your project.
                So, start using https://swap.online/ today and enjoy the power of true decentralization."
            />
            </div>
          )
        }
      </section>
    )
  }
}
