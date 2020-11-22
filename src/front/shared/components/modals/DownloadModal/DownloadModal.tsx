import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './DownloadModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import CopyToClipboard from 'react-copy-to-clipboard'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import { withRouter } from 'react-router-dom'


const title = defineMessages({
  downloadModal: {
    id: 'down97',
    defaultMessage: 'Your private keys!',
  },
})

@injectIntl
@withRouter
@connect(
  ({
    user: { ethData, btcData, ghostData, nextData, tokensData },
  }) => ({
    items: [ethData, btcData, ghostData, nextData],
  })
)
@cssModules(styles)
export default class DownloadModal extends React.Component<any, any> {

  props: any

  state = {
    isTextCopied: false,
    Ru: false,
  }

  componentWillMount() {
    this.checkLang()
  }

  handleCopyText = () => {
    this.setState({
      isTextCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isTextCopied: false,
        })
      }, 15 * 1000)
    })
  }

  handleDownloadTxt = () => {
    actions.user.downloadPrivateKeys()
  }

  checkLang = () => {
    const { match: { params: { locale } } } = this.props
    if (locale === 'ru') {
      this.setState({
        Ru: true,
      })
    }
  }

  render() {
    const { isTextCopied, Ru } = this.state
    const { items, name, match: { params: { locale } }, intl } = this.props

    const textToCopy = actions.user.getText()

    const Account = () => (
      items.map(item => (
        <Fragment>
          <a>
            {item.fullName}
            {' '}
            <FormattedMessage id="downloadModal75" defaultMessage="Address:" />
          </a>
          <p>{item.address}</p>
          <a>
            {item.fullName}
            {' '}
            <FormattedMessage id="downloadModal782" defaultMessage="Private key" />
            {' '}
          </a>

          <p>
            {item.privateKey}
          </p>
        </Fragment>
      ))
    )

    return (
      <Modal name={name} title={intl.formatMessage(title.downloadModal)}>
        <div styleName="subTitle">
          <FormattedMessage
            id="down57"
            defaultMessage="It seems like you're trying to save your private keys. Just copy this keys and paste into notepad textarea. Also you can download it as a .txt file."
          />
        </div>
        <div styleName="buttonsContainer">
          <CopyToClipboard text={textToCopy} onCopy={this.handleCopyText}>
            <Button styleName="button" brand disabled={isTextCopied}>
              {isTextCopied ?
                <FormattedMessage id="down64" defaultMessage="Address copied to clipboard" /> :
                <FormattedMessage id="down65" defaultMessage="Copy to clipboard" />
              }
            </Button>
          </CopyToClipboard>
          {
            !(/iPad|iPhone|iPod/.test(navigator.userAgent)) && (
              <Fragment>
                <Button onClick={this.handleDownloadTxt} styleName="button" brand >
                  <FormattedMessage id="downFile2" defaultMessage="Download txt file" />
                </Button>
              </Fragment>
            )
          }
        </div>
        <div styleName="indent">
          <Account />
        </div>
      </Modal>
    )
  }
}
