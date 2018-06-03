import React from 'react'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
// import FeedNotification from './FeedNotification/FeedNotification'
import Swap from 'components/Swap/Swap'


const PageSwap = ({ match: { params : { orderId } } }) => (
  <section>
    <PageHeadline>
      <SubTitle>
        Feed notification<br />
      </SubTitle>
    </PageHeadline>
    <Swap orderId={orderId} />
  </section>
)

export default PageSwap
