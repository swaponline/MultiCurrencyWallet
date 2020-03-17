import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'
import cssModules from 'react-css-modules'
import defaultStyles from '../Styles/default.scss'
import styles from './TokenMultisignProposeTransaction.scss'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import { ShareLink } from 'components/controls'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import links from 'helpers/links'
import SwapApp from 'swap.app'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

@injectIntl
@connect(
  ({
    user: { ethData },
  }) => ({
    //    multisigData: tokenMultisigUserData,
    ethData: ethData
  })
)
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
export default class TokenMultisignProposeTransaction extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      joinLink: '',
      allowClose: false
    }
  }

  async componentDidMount() {
    console.info('DID MOUNT')

    await sleep(5000)

    const ethereumAddress = this.props.ethData.address
    const ipfsAddress = SwapApp.shared().services.room.peer

    this.setState({
      joinLink: `${location.origin}/#${links.multisign}/usdt/create/${ethereumAddress}/${ipfsAddress}`,
    })

    SwapApp.shared().services.room.subscribe('usdt multisig created', (data) => {
      this.setState({
        allowClose: true
      })
    })
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }

    actions.modals.close(name)
  }

  handleFinish = async () => {
    actions.modals.close('TokenMultisig')

    history.push(localisedUrl(locale, links.home))
  }

  render() {
    //const { phone, step, error, smsCode, smsConfirmed, isShipped } = this.state
    const { intl } = this.props
    const { joinLink, allowClose } = this.state

    const langLabels = defineMessages({
      multiSignJoinLinkMessage: {
        id: 'multiSignJoinLinkMessage',
        defaultMessage: `Отправьте эту ссылку второму владельцу кошелька`,
      },
      multiSignJoinLink: {
        id: 'multiSignJoinLink',
        defaultMessage: `Создание USDT-Multisign кошелька`,
      },
      multiSignJoinLinkCopied: {
        id: 'multiSignJoinLinkCopied',
        defaultMessage: `Ready. Link copied to clipboard`,
      },
      multiSignJoinLinkCopy: {
        id: 'multiSignJoinLinkCopy',
        defaultMessage: `Copy to clipboard`,
      },
    })

    return (
      <Modal name="TokenMultisignProposeWallet" title={`${intl.formatMessage(langLabels.multiSignJoinLink)}`} onClose={this.handleClose} showCloseButton={true}>
        <Fragment>
          <p styleName="notice">
            <FormattedMessage {...langLabels.multiSignJoinLinkMessage} />
          </p>
          <div>
            <ShareLink link={joinLink} />
          </div>
          <hr />

          {allowClose == false && <FormattedMessage id="USDTMS_CreateWalletCaption" defaultMessage="Do not close this windows, wait until participant will create wallet" />}
          {allowClose == true && <Button blue styleName="finishButton" fullWidth onClick={this.handleFinish}>
            <FormattedMessage id="USDTMS_CreateWalletReadyButton" defaultMessage="Готово. Открыть кошелек" />
          </Button>
          }
        </Fragment>
      </Modal>
    )
  }
}
