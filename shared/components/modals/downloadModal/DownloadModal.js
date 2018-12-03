import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './downloadModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import CopyToClipboard from 'react-copy-to-clipboard'

import { FormattedMessage } from 'react-intl'


@connect(
  ({
    currencies,
    user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
  }) => ({
    currencies: currencies.items,
    items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
    tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  })
)
@cssModules(styles)
export default class downloadModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isTextCopied: false,
    }
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
    const { name, items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ] } = this.props
    const { isTextCopied } = this.state

    const text = actions.user.getText()

    return (
      <Modal name={name} title="We don`t store your private keys and will not be able to restore them!">
        <div styleName="subTitle">
          <p><FormattedMessage id="down57" defaultMessage="It seems like you're using an IPhone or an IPad." /></p>
          <p><FormattedMessage id="down58" defaultMessage="Just copy this keys and paste into notepad textarea" /> </p>
          <p><FormattedMessage id="down59" defaultMessage="Or make the screen shot" /> </p>
        </div>
        <CopyToClipboard text={text} onCopy={this.handleCopyText}>
          <Button styleName="button" brand disabled={isTextCopied}>
            { isTextCopied ?
              <FormattedMessage id="down64" defaultMessage="Address copied to clipboard" /> :
              <FormattedMessage id="down65" defaultMessage="Copy to clipboard" />
            }
          </Button>
        </CopyToClipboard>
        <div styleName="style">
          <p><FormattedMessage id="down70" defaultMessage="Ethereum address: " /><a>{ethData.address}</a></p>
          <p><FormattedMessage id="down71" defaultMessage="Ethereum Private key: " /><a>{ethData.privateKey}</a></p>

          <p><FormattedMessage id="down73" defaultMessage="Bitcoin address: " /><a>{btcData.address}</a></p>
          <p><FormattedMessage id="down74" defaultMessage="Bitcoin Private key: " /><a>{btcData.privateKey}</a></p>

          <p><FormattedMessage id="down76" defaultMessage="EOS Master Private Key: " /><a>{eosData.masterPrivateKey}</a></p>
          <p><FormattedMessage id="down77" defaultMessage="EOS Account name: " /><a>{eosData.address}</a></p>

          <p><FormattedMessage id="down79" defaultMessage="TELOS Active Private Key: " /><a>{telosData.activePrivateKey}</a></p>
          <p><FormattedMessage id="down80" defaultMessage="TELOS Account name: " /><a>{telosData.address}</a></p>

          <p><FormattedMessage id="down81" defaultMessage="Litecoin address: " /><a>{ltcData.address}</a></p>
          <p><FormattedMessage id="down83" defaultMessage="Litecoin Private key: " /><a>{ltcData.privateKey}</a></p>
        </div>
      </Modal>
    )
  }
}
