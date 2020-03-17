import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'
import cssModules from 'react-css-modules'
import defaultStyles from '../Styles/default.scss'
import styles from './TokenMultisignDeployWallet.scss'
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
    user: { tokenMultisigUserData, ethData },
  }) => ({
    multisigData: tokenMultisigUserData,
    ethData: ethData
  })
)
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
export default class TokenMultisignDeployWallet extends React.Component {
  static Steps = {
    shareInvite: 'ShareInvite',
    addWallet: 'AddWallet'
  }

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      joinLink: '',
      step: Steps.shareInvite
    }
  }

  async componentDidMount() {
    actions.ipfs.onReady(() => {
      const ethereumAddress = this.props.ethData.address
      const ipfsAddress = SwapApp.shared().services.room.peer

      const action = 'join'

      this.setState({
        joinLink: `${location.origin}/#${links.multisign}/usdt/${action}/${ethereumAddress}/${ipfsAddress}`,
      })

      SwapApp.shared().services.room.subscribe('usdt multisig created', (data) => {
        this.setState({
          step: Steps.addWallet
        })
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

    // history.push(localisedUrl(locale, links.home))
  }

  render() {
    //const { phone, step, error, smsCode, smsConfirmed, isShipped } = this.state
    const { intl } = this.props
    const { joinLink, isLinkCopied } = this.state

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
      <Modal name="TokenMultisig" title={`${intl.formatMessage(langLabels.multiSignJoinLink)}`} onClose={this.handleClose} showCloseButton={true}>
        <Fragment>
          <p styleName="notice">
            <FormattedMessage {...langLabels.multiSignJoinLinkMessage} />
          </p>
          <div>
            <ShareLink link={joinLink} />
          </div>
          <hr />

          {step == 'shareInvite' && <FormattedMessage defaultMessage="Do not close this windows, wait until participant will create wallet" />}
          {step == 'addWallet' && <Button blue styleName="finishButton" fullWidth onClick={this.handleFinish}>
            <FormattedMessage id="USDTMS_CreateWalletReadyButton" defaultMessage="Готово. Открыть кошелек" />
          </Button>
          }
        </Fragment>
      </Modal>
    )
  }
}
