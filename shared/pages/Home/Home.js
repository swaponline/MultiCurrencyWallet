import React from 'react'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Title from 'components/PageHeadline/Title/Title'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Href from 'components/Href/Href'

import Orders from './Orders/Orders'


const Home = () => (
  <section>
    <PageHeadline>
      <Title>Swap.Online</Title>
      <SubTitle>
        We are working to start swap.online as soon as possible.<br />
        Subscribe to <Href tab="https://t.me/swaponlineint">telegram</Href> and <Href redirect="/">mailing list</Href>
      </SubTitle>
    </PageHeadline>
    <Orders />
  </section>
)

export default Home
