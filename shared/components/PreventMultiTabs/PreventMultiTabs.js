import React, { Component } from 'react'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './PreventMultiTabs.scss'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

@CSSModules(styles)
export default class PreventMultiTabs extends Component {

  render() {
    return (
      <div className="preventMultiTabs">
        <WidthContainer>
        <h1>Such error, many tabs</h1>
        Swap.Online supports only one active tab.
        Please reload this page to continue using this tab or close it.
        </WidthContainer>
      </div>
    )
  }
}
