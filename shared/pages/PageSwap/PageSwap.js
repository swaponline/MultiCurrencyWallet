import React from 'react'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Swap from 'components/Swap/Swap'


const PageSwap = ({ match: { params : { orderId } } }) => (
  <section>
    <PageHeadline>
      <SubTitle>
        My swaps<br />
      </SubTitle>
    </PageHeadline>
    <Swap orderId={orderId} />
  </section>
)

export default PageSwap
