import React from 'react'
import PropTypes from 'prop-types'
import CopyToClipboard from 'react-copy-to-clipboard'
import Link from 'sw-valuelink'

import CSSModules from 'react-css-modules'
import styles from './Field.scss'

import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'


@CSSModules(styles)
export default class Field extends React.Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired,
  }

  state = {
    isLinkCopied: false,
  }

  handleCopyLink = () => {
    this.setState({
      isLinkCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isLinkCopied: false,
        })
      }, 500)
    })
  }

  render() {
    const { isLinkCopied } = this.state
    const { label, privateKey } = this.props

    return (
      <div styleName="container">
        <div styleName="label">{label.toUpperCase()}</div>
        <Input
          styleName="input"
          valueLink={Link.value(privateKey)}
          readOnly
        />
        <CopyToClipboard
          text={privateKey}
          onCopy={this.handleCopyLink}
        >
          <Button styleName="button" white={!isLinkCopied} green={isLinkCopied}>
            {isLinkCopied ? 'Copied' : 'Copy'}
          </Button>
        </CopyToClipboard>
      </div>
    )
  }
}
