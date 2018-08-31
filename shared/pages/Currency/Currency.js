import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'

import Row from './Row/Row'


@connect(({ currencies }) => ({
  currencies: currencies.items,
}))
export default class Currency extends Component {

  getRows = () => {
    let { match:{ params: { currency } }, currencies } = this.props

    if (currency === 'bitcoin') {
      currencies = currencies.filter(c => c.value !== currency)
    } else {
      currencies = currencies.filter(c => c.value === 'btc')
    }

    currencies = currencies.reduce((previous, current) =>
      previous.concat({ from: currency, to: current.fullTitle }, { from: current.fullTitle, to: currency }),
    [])

    return currencies
  }

  render() {
    const { match:{ params: { currency } } } = this.props

    return (
      <section>
        <PageHeadline>
          <Fragment>
            <Title>{currency}</Title>
            <SubTitle>{currency.toUpperCase()} Trade</SubTitle>
          </Fragment>
        </PageHeadline>
        <Table
          titles={['Coin', 'Exchange', '']}
          rows={this.getRows()}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
      </section>
    )
  }
}
