import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './MultisignJoinLink.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { ShareLink } from 'components/controls'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'

import typeforce from 'swap.app/util/typeforce'
// import { isCoinAddress } from 'swap.app/util/typeforce'
import minAmount from 'helpers/constants/minAmount'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'

import links from 'helpers/links'
import { getFullOrigin } from 'helpers/links'

import SwapApp from 'swap.app'


import CopyToClipboard from 'react-copy-to-clipboard'



@injectIntl
@connect(
  ({
    user: {
      btcData,
    },
  }) => ({
    btcData,
  })
)
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
export default class MultisignJoinLink extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      joinLink: ''
    }
  }

  componentDidMount() {
    const {
      data: {
        action,
      },
      btcData,
    } = this.props

    const publicKey = btcData.publicKey.toString('Hex')

    const linkAction = (action) ? action : `join`

    const joinLink = `${getFullOrigin()}${links.multisign}/btc/${linkAction}/${publicKey}/${SwapApp.shared().services.room.peer}`

    this.setState({
      joinLink,
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
    const { name } = this.props

    actions.modals.close(name)

    if (this.props.data.callback) {
      this.props.data.callback()
    }
  }

  render() {
    //const { phone, step, error, smsCode, smsConfirmed, isShipped } = this.state
    const { name, intl } = this.props
    const { joinLink, isLinkCopied } = this.state

    const { showCloseButton } = this.props.data

    const langLabels = defineMessages({
      multiSignJoinLinkMessage: {
        id: 'multiSignJoinLinkMessage',
        defaultMessage: `Отправьте эту ссылку второму владельцу кошелька`,
      },
      multiSignJoinLink: {
        id: 'multiSignJoinLink',
        defaultMessage: `Создание BTC-Multisign кошелька`,
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
      <Modal name={name} title={`${intl.formatMessage(langLabels.multiSignJoinLink)}`} onClose={this.handleClose} showCloseButton={showCloseButton}>
        <Fragment>
          <p styleName="notice">
            <FormattedMessage { ... langLabels.multiSignJoinLinkMessage } />
          </p>
          <div className="ym-hide-content">
            <ShareLink link={joinLink} />
          </div>
          <hr />
          <Button blue styleName="finishButton" fullWidth onClick={this.handleFinish}>
            <FormattedMessage id="BTCMS_CreateWalletReadyButton" defaultMessage="Готово. Открыть кошелек" />
          </Button>
        </Fragment>
      </Modal>
    )
  }
}
