import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'

import Row from './Row/Row'

import { getSeoPage } from 'helpers/seo'


@connect(({ currencies }) => ({
  currencies: currencies.items,
}))
export default class Currency extends Component {

  getRows = () => {
    let { match:{ params: { currency, exchange } }, currencies } = this.props

    if (currency === 'btc') {
      currencies = currencies.filter(c => c.value !== currency)
    } else {
      currencies = currencies.filter(c => c.value === 'btc')
    }

    if (exchange === 'sell') {
      currencies = currencies.reduce((previous, current) =>
        previous.concat({ from: current.value, to: currency }),
      [])
    } else {
      currencies = currencies.reduce((previous, current) =>
        previous.concat({ from: currency, to: current.value }),
      [])
    }

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
