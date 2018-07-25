import React from 'react'
import { connect } from 'redaction'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'


const Affiliate = ({ address }) => (
  <section style={{ height: '100%' }}>
    <PageHeadline>
      <SubTitle>
        Make up to $1000 per Client! Swap.Online Affiliate Program
      </SubTitle>
    </PageHeadline>
    <iframe width="100%" height="550px" title="wiki.swap.online" src={`https://wiki.swap.online/affiliate.php?addr=${address}`} frameBorder="0" />
  </section>
)

export default connect(state => ({
  address: state.user.ethData.address,
}))(Affiliate)
