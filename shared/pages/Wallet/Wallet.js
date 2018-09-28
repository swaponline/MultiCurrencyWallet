import React, { Component } from 'react'
import propTypes from 'prop-types'
import { isMobile } from 'react-device-detect'

import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import { WithdrawButton } from 'components/controls'
import KeyActionsPanel from 'components/KeyActionsPanel/KeyActionsPanel'
import stylesWallet from './Wallet.scss'
import Row from './Row/Row'
import SaveKeysModal from 'components/modals/SaveKeysModal/SaveKeysModal'


import CSSModules from 'react-css-modules'
import cx from 'classnames'
import { withRouter } from 'react-router'


@withRouter
@connect(
  ({
    core: { hiddenCoinsList },
    user: { ethData, btcData, bchData, tokensData, eosData, nimData, usdtData, ltcData },
    currencies: { items: currencies },
  }) => ({
    tokens: Object.keys(tokensData).map(k => (tokensData[k])),
    items: [ ethData, btcData, eosData, bchData, ltcData, usdtData /* nimData */ ],
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
  }

  componentWillMount() {
    if (localStorage.getItem(constants.localStorage.privateKeysSaved)) {
      this.changeView('checkKeys')
    } else {
      // actions.modals.open(constants.modals.PrivateKeys, {})
    }
  }

  componentDidMount() {
    actions.user.getBalances()
    actions.analytics.dataEvent('open-page-balances')
  }

  componentWillReceiveProps(props) {
    if (!this.state.zeroBalance) {
      return
    }

    if (props.items.some(o => o.balance > 0) || props.tokens.some(t => t.balance > 0)) { // if at least one balance is greater than 0
      this.setState({ zeroBalance: false })
    }
  }

  handleClear = (event) => {
    event.preventDefault()
    window.localStorage.clear()
    window.location.reload()
  }

  changeView = (view) => {
    this.setState({
      view,
    })
  }

  render() {
    const { view, zeroBalance } = this.state
    const { items, tokens, currencies, hiddenCoinsList } = this.props
    const titles = [ 'Coin', 'Name', 'Balance', !isMobile && 'Address', isMobile ? 'Send, receive, swap' :  'Actions' ]

    const keysSaved = localStorage.getItem(constants.localStorage.privateKeysSaved)
    const testNetSkip = localStorage.getItem(constants.localStorage.testnetSkipPKCheck)

    const showSaveKeysModal = !zeroBalance && !keysSaved && !testNetSkip // non-zero balance and no keys saved

    return (
      <section>
        { showSaveKeysModal && <SaveKeysModal /> }
        <PageHeadline>
          <SubTitle>
            Swap.Online - Cryptocurrency Wallet with Atomic Swap Exchange
          </SubTitle>
        </PageHeadline>
        <Table
          classTitle={styles.wallet}
          titles={titles}
          rows={[...items, ...tokens].filter(coin => !hiddenCoinsList.includes(coin.currency))}
          rowRender={(row, index) => (
            <Row key={index} {...row} currencies={currencies} hiddenCoinsList={hiddenCoinsList} />
          )}
        />
        <KeyActionsPanel />
      </section>
    )
  }
}
