import React, { Component } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage, injectIntl } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './Copy.scss'

@CSSModules(styles, { allowMultiple: true })
class Copy extends Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      showTip: false,
    }
  }

  handleCopyLink = () => {
    const { onCopy } = this.props
    if (onCopy) onCopy()
    if (this.state.showTip) {
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
        <div styleName="copyTip">
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

export default injectIntl(Copy)
