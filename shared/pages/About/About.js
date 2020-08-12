import React from 'react'
import { connect } from 'redaction'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import { FormattedMessage } from 'react-intl'


const About = ({ address }) => (
  <section style={{ height: '100%' }}>
    <iframe width="100%" height="750px" style={{ marginTop: '30px' }} title="wiki.swaponline.io" src={` https://wiki.swaponline.io/about-swap-online/`} frameBorder="0" />
  </section>
)

export default connect(state => ({
  address: state.user.ethData.address,
}))(About)
