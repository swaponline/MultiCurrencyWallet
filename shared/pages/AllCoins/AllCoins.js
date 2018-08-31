import React, { Component } from 'react'
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
import stylesAllCoins from './AllCoins.scss'

import Row from './Row/Row'
import CSSModules from 'react-css-modules'
import { withRouter } from 'react-router'


@withRouter
@connect(({ core: { hiddenCoinsList }, user: { ethData, btcData, tokensData, eosData, nimData, usdtData } , currencies: { items: currencies }}) => ({
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
  items: [ ethData, btcData, eosData, usdtData /* eosData  nimData */ ],
  currencies,
  hiddenCoinsList
}))
@CSSModules(stylesAllCoins, { allowMultiple: true })
export default class Wallet extends Component {

  state = {
    view: 'off',
  }

  componentWillMount() {
    if (localStorage.getItem(constants.localStorage.privateKeysSaved)) {
      this.changeView('checkKeys')
    }
  }

  componentDidMount() {
    actions.user.getBalances()
    actions.analytics.dataEvent('open-page-balances')
    // if (!localStorage.getItem(constants.localStorage.privateKeysSaved)) {
    //   actions.modals.open(constants.modals.PrivateKeys, {})
    // }
  }

  handleClear = process.env.MAINNET ? () => {} : (event) => {
    event.preventDefault()
    window.localStorage.clear()
    window.location.reload()
  }

  render() {
    const { view } = this.state
    const { items, tokens, currencies, hiddenCoinsList } = this.props
    const titles = [ 'Coin','Name', 'Actions' ]

    return (
      <section>

        <SubTitle>
          Coins in Wallet
        </SubTitle>

        <Table
          classTitle={styles.wallet}
          titles={titles}
          rows={[...items, ...tokens].filter(coin=>!hiddenCoinsList.includes(coin.currency))}
          rowRender={(row, index) => (
            <Row key={index} {...row} isHidden={false} currencies={currencies} />
          )}
        />
        {
        hiddenCoinsList.length !== 0 && <div>
                <SubTitle>
                  Other coins
                </SubTitle>
                <Table
                  classTitle={styles.wallet}
                  titles={titles}
                  rows={[...items, ...tokens].filter(coin=>hiddenCoinsList.includes(coin.currency))}
                  rowRender={(row, index) => (
                    <Row key={index} {...row} isHidden={true} currencies={currencies} />
                  )}
                />
              </div>
        }
      </section>
    )
  }
}
