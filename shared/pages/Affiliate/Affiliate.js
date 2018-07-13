import React, { PureComponent } from 'react'
import { connect } from 'redaction'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'


@connect(state => ({
  address: state.user.ethData.address,
}))
export default class Affiliate extends PureComponent {
  render() {
    const { address } = this.props
    console.log(address)

    return (
      <section style={{ height: '100%' }}>
        <PageHeadline>
          <SubTitle>
            Make up to $1000 per Client! Swap.Online Affiliate Program
          </SubTitle>
        </PageHeadline>
        <iframe width="100%" height="550px" title="wiki.swap.online" src={`https://wiki.swap.online/affiliate.php?addr=${address}`} frameBorder="0" />
      </section>
    )
  }
}
