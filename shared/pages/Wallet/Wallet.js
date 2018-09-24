import React, { Component } from 'react'
import propTypes from 'prop-types'
import { isMobile } from 'react-device-detect'

import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import Confirm from 'components/Confirm/Confirm'
import SaveKeys from 'components/SaveKeys/SaveKeys'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import { WithdrawButton } from 'components/controls'
import stylesWallet from './Wallet.scss'
import Row from './Row/Row'
import Overlay from 'components/layout/Overlay/Overlay'
import Center from 'components/layout/Center/Center'

import CSSModules from 'react-css-modules'
import cx from 'classnames'
import { withRouter } from 'react-router'


@withRouter
@connect(
  ({
    core: { hiddenCoinsList },
    user: { ethData, btcData, bchData, tokensData, eosData, nimData, usdtData },
    currencies: { items: currencies },
  }) => ({
    tokens: Object.keys(tokensData).map(k => (tokensData[k])),
    items: [ ethData, btcData, eosData, bchData /* usdtData eosData  nimData */ ],
    currencies,
    hiddenCoinsList,
  })
)
@CSSModules(stylesWallet, { allowMultiple: true })
export default class Wallet extends Component {

  static propTypes = {
    core: propTypes.object,
    user: propTypes.object,
    currencies: propTypes.arrayOf(propTypes.object),
    hiddenCoinsList: propTypes.array,
    history: propTypes.object,
    items: propTypes.arrayOf(propTypes.object),
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

    if (props.items.some(o => o.balance > 0)) { // if at least one balance is greater than 0
      this.setState({ zeroBalance: false })
    }
  }

  handleClear = process.env.MAINNET ? () => {} : (event) => {
    event.preventDefault()
    window.localStorage.clear()
    window.location.reload()
  }

  handleShowMore = () => {
    actions.modals.open(constants.modals.ShowMoreCoins, {})
    // this.props.history.push('/coins')
  }

  handleDownload = () => {
    actions.user.downloadPrivateKeys()
    // this.changeView('checkKeys')
  }

  handleConfirm = () => {
    this.askPrivateKeysApproval()
    // this.changeView('checkKeys')
    // localStorage.setItem(constants.localStorage.privateKeysSaved, true)
  }

  askPrivateKeysApproval() {
    if (!localStorage.getItem(constants.localStorage.privateKeysSaved)) {
      actions.modals.open(constants.modals.PrivateKeys, {})
    }
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

    const showOverlay = !zeroBalance && !keysSaved && !testNetSkip // non-zero balance and no keys saved

    return (
      <section>
        {
          showOverlay &&
          <Overlay>
            <Center keepFontSize>
              { process.env.TESTNET && (
                <a
                  href="#"
                  onClick={() => {
                    localStorage.setItem(constants.localStorage.testnetSkipPKCheck, true)
                    this.forceUpdate()
                  }}>
                  Testnet: Don`t ask again
                </a>
              )}
              {

                view === 'off' &&
                <SaveKeys
                  isDownload={this.handleDownload}
                  isChange={() => this.changeView('on')}
                />
              }
              {
                view === 'on' &&
                <Confirm
                  rootClassName={stylesWallet.areYouSure}
                  title="Are you sure ?"
                  isConfirm={() => this.handleConfirm()}
                  isReject={() => this.changeView('off')}
                  animation={view === 'on'}
                />
              }
            </Center>
          </Overlay>
        }
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
        <div>
          {/* TODO: Useless condition below? */}
          {
            view === 'off' && !showOverlay &&
            <SaveKeys
              className={cx('', { [stylesWallet.saveKeysShow] : !zeroBalance && view === 'off' })}
              isDownload={this.handleDownload}
              isChange={() => this.changeView('on')}
            />
          }
          { process.env.TESTNET && <WithdrawButton onClick={this.handleClear} >Exit</WithdrawButton> }
          <WithdrawButton onClick={this.handleDownload}>Download keys</WithdrawButton>
          <WithdrawButton onClick={this.handleImportKeys}>Import keys</WithdrawButton>
          {
            hiddenCoinsList.length !== 0 &&
            <WithdrawButton onClick={this.handleShowMore}>
              Show more coins ({hiddenCoinsList.length})
            </WithdrawButton>
          }
        </div>
      </section>
    )
  }
}
