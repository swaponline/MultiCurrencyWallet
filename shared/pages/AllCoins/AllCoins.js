import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'

import Table from 'components/tables/Table/Table'
import styles from 'components/tables/Table/Table.scss'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'

import Row from './Row/Row'
import { withRouter } from 'react-router'


@withRouter
@connect(({ core: { hiddenCoinsList }, user: { ethData, btcData, tokensData, eosData, nimData, usdtData }, currencies: { items: currencies } }) => ({
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
  items: [ ethData, btcData, eosData, usdtData /* eosData  nimData */ ],
  currencies,
  hiddenCoinsList,
}))
export default class Wallet extends Component {

  state = {
    view: 'off',
  }

  render() {
    const { items, tokens, currencies, hiddenCoinsList } = this.props
    const titles = [ 'Coin', 'Name', 'Actions' ]

    return (
      <section style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <div style={{ width: '500px' }}>
          <SubTitle style={{ marginTop: '80px' }}>
            Coins in Wallet
          </SubTitle>
          <Table
            classTitle={styles.wallet}
            titles={titles}
            rows={[...items, ...tokens].filter(coin => !hiddenCoinsList.includes(coin.currency))}
            rowRender={(row, index) => (
              <Row key={index} {...row} isHidden={false} currencies={currencies} />
            )}
          />
        </div>
        {
          hiddenCoinsList.length !== 0 && (
            <div style={{ width: '500px' }}>
              <SubTitle>
                Other coins
              </SubTitle>
              <Table
                classTitle={styles.wallet}
                titles={titles}
                rows={[...items, ...tokens].filter(coin => hiddenCoinsList.includes(coin.currency))}
                rowRender={(row, index) => (
                  <Row key={index} {...row} isHidden currencies={currencies} />
                )}
              />
            </div>
          )
        }
      </section>
    )
  }
}
