import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './ShowMoreCoins.scss'

import { Modal } from 'components/modal'
import { FieldLabel } from 'components/forms'
import { Button } from 'components/controls'
import Table from 'components/tables/Table/Table'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Row from './Row/Row'

@connect(({ core: { hiddenCoinsList }, user: { ethData, btcData, bchData, tokensData, eosData, nimData, usdtData }, currencies: { items: currencies } }) => ({
  tokens: Object.keys(tokensData).map(k => tokensData[k]),
  items: [ethData, btcData, eosData, usdtData, bchData /* eosData  nimData */],
  currencies,
  hiddenCoinsList,
}))
@cssModules(styles, { allowMultiple: true })
export default class ShowMoreCoins extends Component {
  render() {
    const { name, items, tokens, currencies, hiddenCoinsList } = this.props
    const titles = ['Coin', 'Name', 'Actions']

    return (
      <Modal name={name} title="Show More Coins" shouldCenterVertically={false}>
        <div styleName="modal">
          <div styleName="modal_column">
            <SubTitle styleName="modal_column-title">Coins in Wallet</SubTitle>
            <Table
              classTitle={styles.wallet}
              titles={titles}
              rows={[...items, ...tokens].filter(coin => !hiddenCoinsList.includes(coin.currency))}
              rowRender={(row, index) => <Row key={index} {...row} isHidden={false} currencies={currencies} />}
            />
          </div>
          {hiddenCoinsList.length !== 0 && (
            <div styleName="modal_column">
              <SubTitle styleName="modal_column-title">Other coins</SubTitle>
              <Table
                classTitle={styles.wallet}
                titles={titles}
                rows={[...items, ...tokens].filter(coin => hiddenCoinsList.includes(coin.currency))}
                rowRender={(row, index) => <Row key={index} {...row} isHidden currencies={currencies} />}
              />
            </div>
          )}
        </div>
      </Modal>
    )
  }
}
