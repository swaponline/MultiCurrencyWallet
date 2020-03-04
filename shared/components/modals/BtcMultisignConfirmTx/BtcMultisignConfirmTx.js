import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './BtcMultisignConfirmTx.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'

import links from 'helpers/links'


const langPrefix = `multiSignConfirmTxModal`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Подтверждение BTC Multisign транзакции`,
  },
  noticeUp: {
    id: `${langPrefix}_UpNotice`,
    defaultMessage: `Ознакомьтесь с транзакцией и подтвердите её. Если вы против списания, отмените тразакцию`,
  },
  noticeFetching: {
    id: `${langPrefix}_NoticeFetching`,
    defaultMessage: `Загрузка...`,
  },
  confirmTx: {
    id: `${langPrefix}_ConfirmTx`,
    defaultMessage: `Подтвердить`,
  },
  dismatchTx: {
    id: `${langPrefix}_DismatchTx`,
    defaultMessage: `Отклонить`,
  },
})

@injectIntl
@connect(
  ({
    user: { btcMultisigUserData },
  }) => ({
    btcData: btcMultisigUserData,
  })
)
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
export default class BtcMultisignConfirmTx extends React.Component {
  
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)



    this.state = {
      step: `fetchgin`,
    }
  }

  componentDidMount() {
    setTimeout(async () => {
      const {
        data: {
          txData,
        }
      } = this.props

      this.setState({
        step: `txInfo`,
        txRaw: txData,
        txData: await actions.btcmultisig.parseRawTX(txData),
      })
    })
  }

  handleConfirm = async() => {
    const {
      txRaw,
      txData,
    } = this.state

    const {
      name,
    } = this.props

    this.setState({
      isConfirming: true,
    })

    const signedTX = await actions.btcmultisig.signMultiSign( txRaw )
    let txID = false
    try {
      txID = await actions.btcmultisig.broadcastTx( signedTX )
    } catch (e) {
      console.log(e)
    }
    if (txID && txID.txid) {
      this.handleClose()

      const infoPayData = {
        amount: `${txData.amount}`,
        currency: 'BTC (Multisig)',
        balance: 0,
        oldBalance: 0, // @Todo доделать old balance
        txId: txID.txid,
        toAddress: txData.to,
      }

      actions.modals.open(constants.modals.InfoPay, infoPayData)
    } else {
      console.log(txID)
      this.setState({
        isError: true,
        isConfirming: false,
      })
    }
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

  render() {
    const {
      name,
      intl,
      data: {
        showCloseButton,
      },
    } = this.props

    const {
      step,
      txData,
      isConfirming,
    } = this.state

    const { debugShowTXB, debugShowInput, debugShowOutput } = this.state

    return (
      <Modal name={name} title={`${intl.formatMessage(langLabels.title)}`} onClose={this.handleClose} showCloseButton={showCloseButton}>
        <Fragment>
          <p styleName="notice">
            <FormattedMessage { ... langLabels.noticeUp } />
          </p>
          {step === `fetchgin` && (
            <p styleName="notice">
              <FormattedMessage { ... langLabels.noticeFetching } />
            </p>
          )}
          {step === `txInfo` && (
            <Fragment>
              <h1>
                <FormattedMessage id="BTCMS_ConfirmTxTitle" defaultMessage="Подтверждение транзакции" />
              </h1>
              <h3>
                <FormattedMessage
                  id="BTCMS_FromAddress"
                  defaultMessage="Оплата с кошелка: {address}"
                  values={{address: txData.from}}
                />
              </h3>
              <h3>
                <FormattedMessage
                  id="BTCMS_Amount"
                  defaultMessage="Сумма транзакции: {amount} BTC"
                  values={{amount: txData.amount}}
                />
              </h3>
              <h3>
                <FormattedMessage
                  id="BTCMS_ToAddress"
                  defaultMessage="Получатель: {address}"
                  values={{address: txData.to}}
                />
              </h3>
              <hr />
              <h3>
                <button onClick={ () => { this.setState({debugShowInput: !debugShowInput}) } }>
                  <FormattedMessage id="BTCMS_ConfirmTxInputs" defaultMessage="Входы транзакции" />
                </button>
              </h3>
              {debugShowInput &&
              <pre>
                <code>
                  {
                    JSON.stringify(this.state.txData.input, false, 4)
                  }
                </code>
              </pre>
              }
              <h3>
                <button onClick={ () => { this.setState({debugShowOutput: !debugShowOutput}) } }>
                  <FormattedMessage id="BTCMS_ConfirmTxOutputs" defaultMessage="Выходы транзакции" />
                </button>
              </h3>
              {debugShowOutput &&
              <pre>
                <code>
                  {
                    JSON.stringify(this.state.txData.output, false, 4)
                  }
                </code>
                <code>
                  {
                    JSON.stringify(this.state.txData, false, 4)
                  }
                </code>
              </pre>
              }
              <hr />
              <div styleName="buttonsHolder">
                <Button
                  styleName="buttonFull"
                  blue
                  disabled={isConfirming}
                  onClick={this.handleConfirm}
                  fullWidth
                >
                  <FormattedMessage { ... langLabels.confirmTx } />
                </Button>
                <Button
                  styleName="buttonFull"
                  blue
                  disabled={isConfirming}
                  onClick={this.handleClose}
                  fullWidth
                >
                  <FormattedMessage { ... langLabels.dismatchTx } />
                </Button>
              </div>
            </Fragment>
          )}
        </Fragment>
      </Modal>
    )
  }
}

window.showConfirm = (txData) => {
  actions.modals.open(constants.modals.BtcMultisignConfirmTx, {
    txData,
  })
}
