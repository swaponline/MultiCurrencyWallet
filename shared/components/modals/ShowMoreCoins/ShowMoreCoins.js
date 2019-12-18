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
import { FormattedMessage } from 'react-intl'


const titles = [
  <FormattedMessage id="Coin" defaultMessage="Coin" />,
  <FormattedMessage id="Name" defaultMessage="Name" />,
  <FormattedMessage id="Actions" defaultMessage="Actions" />,
]

const title2 = [
  <FormattedMessage id="ShMoreCoins" defaultMessage="Show More Coins" />,
]

@connect(({
  core: { hiddenCoinsList },
  user: { ethData, btcData, ltcData, /* xlmData, */ bchData, tokensData, nimData /* usdtOmniData */ },
  currencies: { items: currencies },
}) => ({
  tokens: Object.keys(tokensData).map(k => tokensData[k]),
  items: [ethData, btcData, /* xlmData, */ bchData, ltcData /* usdtOmniData, nimData */],
  currencies,
  hiddenCoinsList,
}))
@cssModules(styles, { allowMultiple: true })
export default class ShowMoreCoins extends Component {
  render() {
    const { name, items, tokens, currencies, hiddenCoinsList } = this.props

    return (
      <Modal name={name} title={title2} shouldCenterVertically={false}>
        <div styleName="modal">
          <div styleName="modal_column">
            <SubTitle styleName="modal_column-title">
              <FormattedMessage id="ShowMoreCoins36" defaultMessage="Coins in Wallet" />
            </SubTitle>
            <Table
              className={styles.wallet}
              titles={titles}
              rows={[...items, ...tokens].filter(coin => !hiddenCoinsList.includes(coin.currency))}
              rowRender={(row, index) => <Row key={index} {...row} isHidden={false} currencies={currencies} />}
            />
          </div>
          {hiddenCoinsList.length !== 0 && (
            <div styleName="modal_column">
              <SubTitle styleName="modal_column-title">
                <FormattedMessage id="ShowMoreCoins48" defaultMessage="Other coins" />
              </SubTitle>
              <Table
                className={styles.wallet}
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
