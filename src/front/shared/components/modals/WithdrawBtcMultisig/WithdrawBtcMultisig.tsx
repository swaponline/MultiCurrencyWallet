import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'
import styles from '../WithdrawModal/WithdrawModal.scss'
import ownStyle from './WithdrawBtcMultisig.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import { ShareLink } from 'components/controls'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'
import InvoiceInfoBlock from 'components/InvoiceInfoBlock/InvoiceInfoBlock'

import typeforce from 'swap.app/util/typeforce'
// import { isCoinAddress } from 'swap.app/util/typeforce'
import minAmount from 'helpers/constants/minAmount'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import links from 'helpers/links'
import CopyToClipboard from 'react-copy-to-clipboard'
import QrReader from "components/QrReader"
import { getFullOrigin } from 'helpers/links'


const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@connect(
  ({
    ui: { dashboardModalsAllowed }
  }) => ({
    dashboardView: dashboardModalsAllowed,
  })
)
@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
export default class WithdrawBtcMultisig extends React.Component<any, any> {

  props: any

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  broadcastCancelFunc: any

  constructor(data) {
    //@ts-ignore
    super()

    this.broadcastCancelFunc = false

    this.state = {
      step: 'fillform',
      isShipped: false,
      error: false,
      txRaw: '',
      isLinkCopied: false,
    }
  }

  componentDidMount() {
    this.setState({
      isShipped: true,
    }, async () => {
      const {
        data: {
          wallet: {
            address,
          },
          sendOptions,
          sendOptions: {
            to,
            amount,
          },
          invoice,
        },
      } = this.props

      const result = await actions.btcmultisig.send(sendOptions)

      let txId = false

      if (result) {
        //@ts-ignore
        txId = await actions.multisigTx.broadcast({
          sender: address,
          destination: to,
          amount,
          fee: 0.0001, // actions.helpers.lastBtcFee
          rawTx: result,
        })
        this.setState({
          step: 'rawlink',
          txRaw: result,
          txId,
          isShipped: false,
        })
      }
    })
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

  handleReady = () => {
    const {
      name,
      data: {
        onReady,
      },
    } = this.props

    actions.modals.close(name)
    if (onReady instanceof Function) {
      onReady()
    }
  }


  handleError = err => {
    console.error(err);
  };

  handleClose = () => {
    const { name } = this.props

    actions.modals.close(name)
  }


  render() {
    const {
      isShipped,
      error,
      step,
      txRaw,
      txId,
      isLinkCopied,
    } = this.state

    const {
      name,
      data: {
        wallet: {
          currency,
        },
        invoice,
      },
      intl,
      portalUI,
    } = this.props

    let txConfirmLink = `${getFullOrigin()}${links.multisign}/btc/confirm/${txId}`
    if (invoice) {
      txConfirmLink = `${getFullOrigin()}${links.multisign}/btc/confirminvoice/${invoice.id}|${txId}`
    }

    const labels = defineMessages({
      withdrowModal: {
        id: 'withdrowTitle271',
        defaultMessage: `Send`,
      },
      ownTxPlaceholder: {
        id: 'withdrawOwnTxPlaceholder',
        defaultMessage: 'Если оплатили с другого источника'
      },
    })

    const formRender = (
      <Fragment>
        {invoice &&
          <InvoiceInfoBlock invoiceData={invoice} />
        }
        {step === 'rawlink' &&
          <Fragment>
            <p styleName="notice dashboardViewNotice">
              <FormattedMessage id="WithdrawMSUserReady" defaultMessage="TX confirm link" />
              <br />
              <FormattedMessage id="WithdrawMSUserMessage" defaultMessage="Send this link to other wallet owner" />
            </p>
            <div styleName="highLevel">
              <div styleName="groupField">

              </div>
              <div>
                <ShareLink link={txConfirmLink} />
              </div>
            </div>
            <div styleName="centerAlign">
              {/*
              //@ts-ignore */}
              <Button styleName="buttonFull" big blue fullWidth onClick={this.handleReady}>
                <FormattedMessage id="WithdrawMSUserFinish" defaultMessage="Ready" />
              </Button>
            </div>
          </Fragment>
        }
      </Fragment>
    )
    return (portalUI) ? formRender : (
      <Modal name={name} title={`${intl.formatMessage(labels.withdrowModal)}${' '}${currency.toUpperCase()}`}>
        {formRender}
      </Modal>
    )
  }
}
