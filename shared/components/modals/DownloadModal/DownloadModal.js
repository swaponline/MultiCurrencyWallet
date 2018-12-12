import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './DownloadModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import CopyToClipboard from 'react-copy-to-clipboard'

import { FormattedMessage } from 'react-intl'


@connect(
  ({
    user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
  }) => ({
    items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
  })
)
@cssModules(styles)
export default class DownloadModal extends React.Component {

  state = {
    isTextCopied: false,
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

  render() {
    const { isTextCopied } = this.state
    const { items, name } = this.props

    const textToCopy = actions.user.getText()

    const RowDownload = ({ id, msg, item }) => (
      <p style={{ fontSize: '16px' }}>
        {item}
        {' '}
        <FormattedMessage  id={id} defaultMessage={msg} />
      </p>
    )

    const Account = () => (
      items.map(item => (
        <Fragment>
          <RowDownload
            id={`${item.currency}${item.fullName}`}
            msg={`${item.currency}` === 'EOS' || `${item.currency}` === 'TLOS' ? 'Account name:' : 'Address:'}
            item={item.fullName}
          />
          <p>{item.address}</p>
          <RowDownload
            item={item.fullName}
            id={`${item.currency}${item.fullName}`}
            msg=" Private key: "
          />
          <p>{item.privateKey}</p>
        </Fragment>
      ))
    )

    return (
      <Modal name={name} title="We don`t store your private keys and will not be able to restore them!">
        <div styleName="subTitle">
          <RowDownload id="down57" msg="It seems like you're using an IPhone or an IPad. Just copy this keys and paste into notepad textarea." />
        </div>
        <CopyToClipboard text={textToCopy} onCopy={this.handleCopyText}>
          <Button styleName="button" brand disabled={isTextCopied}>
            { isTextCopied ?
              <RowDownload id="down64" msg="Address copied to clipboard" /> :
              <RowDownload id="down65" msg="Copy to clipboard" />
            }
          </Button>
        </CopyToClipboard>
        <div styleName="indent">
          <Account />
        </div>
      </Modal>
    )
  }
}
