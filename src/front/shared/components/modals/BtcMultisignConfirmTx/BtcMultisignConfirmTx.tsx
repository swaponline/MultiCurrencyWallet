/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import PropTypes from 'prop-types'
import helpers, { routing } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'

import cssModules from 'react-css-modules'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'

import lsDataCache from 'helpers/lsDataCache'
import styles from './BtcMultisignConfirmTx.scss'
import defaultStyles from '../Styles/default.scss'

@connect(({ user: { btcMultisigUserData } }) => ({
  btcData: btcMultisigUserData,
}))
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
class BtcMultisignConfirmTx extends React.Component<any, any> {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      step: `fetchgin`,
      isControlFetching: true,
      isTxHolder: true,
      address: ``,
      amount: ``,
      from: ``,
    }
  }

  componentDidMount() {
    setTimeout(async () => {
      const {
        data: { txData, txId },
      } = this.props

      if (txId) {
        const txData: any = await actions.multisigTx.fetchTx(txId)

        const { destination: address, sender: from, amount } = txData

        const wallet = actions.btcmultisig.addressToWallet(from)

        if (!wallet) {
          this.setState({
            step: `dinned`,
          })
          return
        }

        this.setState(
          {
            step: `txInfo`,
            txId,
            txData: {
              ...txData,
              wallet,
            },
            address,
            from,
            amount,
          },
          () => {
            // Fetching full tx info (rawTX)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: strictNullChecks
            actions.multisigTx.fetchRawTx(from, txId).then((txAuthedData: any) => {
              if (txAuthedData) {
                actions.btcmultisig.parseRawTX(txAuthedData.rawTx).then((txDataParsed) => {
                  this.setState({
                    txRaw: txAuthedData.rawTx,
                    txData: txDataParsed,
                    isTxHolder: wallet.publicKey.toString(`Hex`) === txAuthedData.holder,
                    isControlFetching: false,
                  })
                })
              } else {
                this.setState({
                  step: `dinned`,
                })
              }
            })
          },
        )
      } else {
        const txDataParsed = await actions.btcmultisig.parseRawTX(txData)

        if (!txDataParsed.isOur) {
          this.setState({
            step: `dinned`,
          })
          return
        }

        this.setState({
          step: `txInfo`,
          txRaw: txData,
          txData: txDataParsed,
          address: txDataParsed.to,
          from: txDataParsed.from,
          amount: txDataParsed.amount,
        })
      }
    })
  }

  handleGoToWallet = () => {
    this.handleClose()
  }

  handleConfirm = async () => {
    const { txId: useBackendId, txRaw, txData, from, address: to, amount } = this.state

    this.setState({
      isConfirming: true,
    })

    const signedTX = await actions.btcmultisig.signMultiSign(txRaw, txData.wallet)
    const btcTxId = await actions.btcmultisig.broadcastTx(signedTX)
    let txId = false

    if (btcTxId && btcTxId.txid) txId = btcTxId.txid

    if (useBackendId) {
      await actions.multisigTx.confirmTx(from, useBackendId, signedTX, txId)
    }

    if (txId) {
      // Сохраняем транзакцию в кеш
      const txInfoCache = {
        amount,
        senderAddress: from,
        receiverAddress: to,
        confirmed: false,
      }

      lsDataCache.push({
        key: `TxInfo_btc_${txId}`,
        time: 3600,
        data: txInfoCache,
      })

      this.handleClose()

      const txInfoUrl = helpers.transactions.getTxRouter('btc', txId)
      routing.redirectTo(txInfoUrl)
    } else {
      this.setState({
        isError: true,
        isConfirming: false,
      })
    }
  }

  handleReject = async () => {
    const { txId: useBackendId, from } = this.state
    if (useBackendId) {
      await actions.multisigTx.rejectTx(from, useBackendId)
      this.handleClose()
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
      data: { showCloseButton },
    } = this.props

    const {
      step,
      txData,
      isConfirming,
      isControlFetching,
      isTxHolder,
    } = this.state

    const linked = Link.all(this, 'address', 'amount', 'from')

    const title = (
      <FormattedMessage
        id="multiSignConfirmTxModal_Title"
        defaultMessage="Confirmation of BTC Multisig transaction"
      />
    )

    return (
      <Modal
        name={name}
        title={title}
        onClose={this.handleClose}
        showCloseButton={showCloseButton}
      >
        <>
          {step !== `dinned` && (
            <p styleName="notice">
              <FormattedMessage
                id="multiSignConfirmTxModal_UpNotice"
                defaultMessage="Review the transaction and confirm it. If you are against the cancellation, reject the transaction"
              />
            </p>
          )}
          <div styleName="confirmTxModal">
            {step === `fetchgin` && (
              <p styleName="notice">
                <FormattedMessage
                  id="multiSignConfirmTxModal_NoticeFetching"
                  defaultMessage="Loading..."
                />
              </p>
            )}
            {step === `dinned` && (
              <>
                <p styleName="rednotes">
                  <FormattedMessage
                    id="multiSignConfirmTxModal_YouCantSignThisTx"
                    defaultMessage="You do not have permission to sign this transaction (check that you have created a multisig)"
                  />
                </p>
                <Button styleName="buttonCenter" blue onClick={this.handleGoToWallet}>
                  <FormattedMessage
                    id="multiSignConfirmTxModal_GoToWalletPage"
                    defaultMessage="Open wallet"
                  />
                </Button>
              </>
            )}
            {step === `txInfo` && (
              <>
                <div styleName="highLevel" style={{ marginBottom: '20px' }}>
                  <FieldLabel>
                    <FormattedMessage
                      id="BtcMultisignConfirmTx_FromAddress"
                      defaultMessage="Оплата с кошелька"
                    />
                    {' '}
                  </FieldLabel>
                  <Input valueLink={linked.from} disabled styleName="input fakeInput" withMargin />
                </div>
                <div styleName="highLevel" style={{ marginBottom: '20px' }}>
                  <FieldLabel>
                    <FormattedMessage id="Withdrow1194" defaultMessage="Address " />
                    {' '}
                    <Tooltip id="WtH203">
                      <div style={{ textAlign: 'center' }}>
                        <FormattedMessage
                          id="WTH275"
                          defaultMessage="Make sure the wallet you{br}are sending the funds to supports {currency}"
                          values={{ br: <br />, currency: `BTC` }}
                        />
                      </div>
                    </Tooltip>
                  </FieldLabel>
                  <Input valueLink={linked.address} disabled styleName="input fakeInput" withMargin />
                </div>
                <div styleName="lowLevel" style={{ marginBottom: '30px' }}>
                  <p styleName="balance walletBalance">
                    {txData.wallet.balance}
                    {' '}
                    BTC
                  </p>
                  <FieldLabel>
                    <FormattedMessage id="orders102" defaultMessage="Amount" />
                  </FieldLabel>

                  <div styleName="group">
                    <Input styleName="input fakeInput" valueLink={linked.amount} disabled />
                  </div>
                </div>
                {isControlFetching ? (
                  <div styleName="buttonsHolder_fetching">
                    <InlineLoader />
                  </div>
                ) : (
                  <div styleName="buttonsHolder">
                    {!isTxHolder && (
                      <Button
                        styleName="buttonFull"
                        blue
                        disabled={isConfirming || isTxHolder}
                        onClick={this.handleConfirm}
                        fullWidth
                      >
                        <FormattedMessage
                          id="multiSignConfirmTxModal_ConfirmTx"
                          defaultMessage="Confirm"
                        />
                      </Button>
                    )}
                    <Button
                      styleName="buttonFull"
                      blue
                      disabled={isConfirming}
                      onClick={isTxHolder ? this.handleClose : this.handleReject}
                      fullWidth
                    >
                      {isTxHolder ? (
                        <FormattedMessage
                          id="multiSignConfirmTxModal_ButtonClose"
                          defaultMessage="Close"
                        />
                      ) : (
                        <FormattedMessage
                          id="multiSignConfirmTxModal_DismatchTx"
                          defaultMessage="Reject"
                        />
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

        </>

      </Modal>
    )
  }
}

export default BtcMultisignConfirmTx
