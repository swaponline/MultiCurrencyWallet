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
    items: propTypes.arrayOf(propTypes.object),
    tokens: propTypes.arrayOf(propTypes.object),
    location: propTypes.object,
    match: propTypes.object,
  }

  state = {
    view: 'off',
    zeroBalance: true,
    saveKeys: false,
  }

  componentWillMount() {
    actions.user.getBalances()
    actions.analytics.dataEvent('open-page-balances')

    if (!process.env.MAINNET) {
      localStorage.setItem(constants.localStorage.testnetSkip, true)
    } else {
      localStorage.setItem(constants.localStorage.privateKeysSaved, true)
      localStorage.setItem(constants.localStorage.testnetSkip, false)
    }
  }

  componentWillReceiveProps() {
    const { currencyBalance } = this.props

    currencyBalance.forEach(cur => {
      if (cur > 0) {
        this.setState(() => ({ zeroBalance: false }))
      }
    })

    const { zeroBalance } = this.state

    const testSkip = JSON.parse(localStorage.getItem(constants.localStorage.testnetSkip))
    const saveKeys = JSON.parse(localStorage.getItem(constants.localStorage.privateKeysSaved))

    if (saveKeys && zeroBalance) {
      this.changeView('checkKeys')
    } else {
      if (testSkip) {
        this.setState(() => ({ saveKeys: true }))
      }
    }
  }

  componentDidUpdate() {
    const { saveKeys } = this.state

    if (saveKeys) {
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
    });
  }

  changeView = (view) => {
    this.setState({
      view,
    })
  }

  render() {
    const { view, zeroBalance } = this.state
    const { items, tokens, currencies, hiddenCoinsList } = this.props
    const titles = [ 'Coin', 'Name', 'Balance', 'Your Address', isMobile ? 'Send, receive, swap' :  'Actions' ]

    const keysSaved = localStorage.getItem(constants.localStorage.privateKeysSaved)
    const testNetSkip = localStorage.getItem(constants.localStorage.testnetSkip)

    const showSaveKeysModal = !zeroBalance && !keysSaved && !testNetSkip // non-zero balance and no keys saved

    return (
      <section styleName={isMobile ? 'sectionWalletMobile' : 'sectionWallet'}>
        { showSaveKeysModal && <SaveKeysModal /> }
        <PageHeadline styleName="pageLine">
          <SubTitle>
            <FormattedMessage id="Wallet104" defaultMessage="Your online cryptocurrency wallet" />
          </SubTitle>
          Deposit funds to addresses below
        </PageHeadline>
        <Table
          id="table-wallet"
          className={styles.wallet}
          titles={titles}
          rows={[...items, ...tokens].filter(currency => !hiddenCoinsList.includes(currency))}
          rowRender={(row, index, selectId, handleSelectId) => (
            <Row key={row} currency={row} currencies={currencies} hiddenCoinsList={hiddenCoinsList} selectId={selectId} index={index} handleSelectId={handleSelectId} />
          )}
        />
        <KeyActionsPanel />
      </section>
    )
  }
}
