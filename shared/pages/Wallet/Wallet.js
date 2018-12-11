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
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import KeyActionsPanel from 'components/KeyActionsPanel/KeyActionsPanel'
import SaveKeysModal from 'components/modals/SaveKeysModal/SaveKeysModal'
import { FormattedMessage } from 'react-intl'

@withRouter
@connect(
  ({
    core: { hiddenCoinsList },
    user: { ethData, btcData, tokensData, eosData, telosData, nimData, usdtData, ltcData },
    currencies: { items: currencies },
  }) => ({
    tokens: Object.keys(tokensData).map(k => (tokensData[k].currency)),
    items: [btcData, ethData, eosData, telosData, ltcData, usdtData /* nimData */ ].map((data) => (
      data.currency
    )),
    currencyBalance: [btcData, ethData, eosData, telosData, ltcData, usdtData /* nimData */ ].map((cur) => (
      cur.balance
    )),
    currencies,
    hiddenCoinsList,
  })
)
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

    const { currencyBalance } = this.props

    currencyBalance.forEach(cur => {
      if (cur > 0) {
        this.setState(() => ({ openModal: true }))
      }
    })
  }

  componentDidUpdate() {
    const { openModal } = this.state

    if (openModal) {
      actions.modals.open(constants.modals.PrivateKeys, {})
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
    const { items, tokens, currencies, hiddenCoinsList } = this.props
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

    return (
      <section styleName={isMobile ? 'sectionWalletMobile' : 'sectionWallet'}>
        <PageHeadline styleName="pageLine">
          <SubTitle style={{ fontFamily: 'Arial' }}>
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
      </section>
    )
  }
}
