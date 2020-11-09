import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage, injectIntl } from 'react-intl'

import { constants } from 'helpers'
import CSSModules from 'react-css-modules'
import styles from './Copy.scss'


const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class Copy extends Component {

  state = {
    showTip: false,
  }

  handleCopyLink = () => {
    if (this.setState.showTip) {
      return
    }
    this.setState({
      showTip: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          showTip: false,
        })
      }, 1000)
    })
  }

  render() {
    const { text, children } = this.props
    const { showTip } = this.state

    return (
      <div styleName="copyWrapper" title="Copy">
        {showTip &&
        <div styleName={`copyTip ${isDark ? 'dark' : ''}`}>
          <FormattedMessage id="RowFeeds64" defaultMessage="Copied!" />
        </div>
        }
        <CopyToClipboard
          onCopy={this.handleCopyLink}
          text={text}
        >
          {children}
        </CopyToClipboard>
      </div>
    )
  }
}
