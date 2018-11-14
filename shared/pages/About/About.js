import React from 'react'
import { connect } from 'redaction'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import { FormattedMessage } from 'react-intl'


const About = ({ address }) => (
  <section style={{ height: '100%' }}>
    <PageHeadline>
      <FormattedMessage id="Affiliate12" defaultMessage="About us">
        {message => <SubTitle>{message}</SubTitle>}
      </FormattedMessage>
    </PageHeadline>
    <iframe width="100%" height="550px" title="wiki.swap.online" src={` https://wiki.swap.online/about-swap-online/`} frameBorder="0" />
  </section>
)

export default connect(state => ({
  address: state.user.ethData.address,
}))(About)
