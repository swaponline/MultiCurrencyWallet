import React from "react";
import styles from "./ShareLink.scss";
import actions from "redux/actions";
import CSSModules from 'react-css-modules'
import { constants } from "helpers";
import Button from 'components/controls/Button/Button'
import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import ShareButton from 'components/controls/ShareButton/ShareButton'


@CSSModules(styles, { allowMultiple: true })
export default class ShareLink extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isLinkCopied: false,
    }
  }

  handleCopyLink = () => {
    this.setState({
      isLinkCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isLinkCopied: false,
        })
      }, 1000)
    })
  }

  render() {
    let {
      link,
      size,
      altText,
    } = this.props

    const {
      isLinkCopied,
    } = this.state

    if (!size) size = 250
    if (!altText) altText = ``;

    return (
      <div>
        <CopyToClipboard
          text={link}
          onCopy={this.handleCopyLink}
        >
          <div onClick={this.handleCopyLink}>
            <div styleName="HolderQRCode">
              <img onClick={this.handleCopyLink}
                src={`https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(link)}`}
                alt={`${altText}`}
              />
            </div>
            <div styleName="HolderLinkShorter">
              <span>{link}</span>
              <span>{link}</span>
            </div>
          </div>
        </CopyToClipboard>
        <div styleName="ButtonsHolder">
          <CopyToClipboard text={link} onCopy={this.handleCopyLink}>
            <Button blue fullWidth disabled={isLinkCopied} styleName="CopyLinkButton">
              {isLinkCopied ?
                <FormattedMessage id="ControlShareLink_LinkCopied" defaultMessage="Link copied" /> :
                <FormattedMessage id="ControlShareLink_CopyLink" defaultMessage="Copy link" />
              }
            </Button>
          </CopyToClipboard>
          <div styleName="ShareButtonHolder">
            <ShareButton link={link} title={`Share link`}></ShareButton>
          </div>
        </div>
      </div>
    )
  }

}


