import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/Table/Table'

import Row from './Row/Row'

import { getSeoPage } from 'helpers/seo'


@connect(({ currencies }) => ({
  currencies: currencies.items
}))
export default class Currency extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currency: props.match.params.currency
    }

    this.pageCurrency = !!props.match.params.currency && props.currencies.find(c => c.value === props.match.params.currency)
    this.seoPage = getSeoPage(props.location.pathname)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.currency !== nextProps.match.params.currency) {
      this.setState({
        currency: nextProps.match.params.currency
      })
      this.pageCurrency = nextProps.match.params.currency && nextProps.currencies.find(c => c.value === nextProps.match.params.currency)
    }
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.seoPage = getSeoPage(nextProps.location.pathname)
    }
  }

  getRows = () => {
    const {
      props: { currencies },
      state: { currency }
    } = this

    return currencies
      .filter(c => c.value !== currency)
      .reduce((previous, current) => {
        previous.push({
          from: this.pageCurrency,
          to: current
        })
        previous.push({
          from: current,
          to: this.pageCurrency
        })

        return previous
      }, [])
  }

  render() {
    return (
      <section>
        <PageHeadline>
          <Fragment>
            <Title>{this.seoPage && this.seoPage.title}</Title>
            <SubTitle>{this.seoPage && this.seoPage.h1}</SubTitle>
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