import React, { Component } from 'react'

import { createSwapApp } from 'instances/swap'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import FeedNotification from './FeedNotification/FeedNotification'


export default class Feed extends Component {

  componentWillMount() {
    createSwapApp()
  }

  render() {
    return (
      <section>
        <PageHeadline>
          <SubTitle>
            Feed notification<br />
          </SubTitle>
        </PageHeadline>
        <FeedNotification  />
      </section>
    )
  }
}
