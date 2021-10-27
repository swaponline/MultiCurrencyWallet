import React, { Fragment, PureComponent } from 'react'
import PropTypes from 'prop-types'

import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'
import { constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import actions from 'redux/actions'
import { links } from 'helpers'
import { getFullOrigin } from 'helpers/links'
import Button from 'components/controls/Button/Button'

import moment from 'moment'

import CSSModules from 'react-css-modules'
import styles from './Btc.scss'
import SwapApp from 'swap.app'
import config from 'app-config'

@connect(({ user: { btcData } }) => {
  return {
    data: btcData,
  }
})
@CSSModules(styles, { allowMultiple: true })
class Btc extends PureComponent<any, any> {
  timerWaitOnlineJoin: any

  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    intl: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    console.log('Btc mulsign connected')

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = mnemonic === `-`

    this.timerWaitOnlineJoin = false
    this.state = {
      action: 'none',
      wallet: {},
      walletBalance: 0,
      publicKey: '',
      mnemonicSaved,
      addWalletEnabled: false,
    }
  }

  async componentWillMount() {
    let {
      match: {
        params: { action, data, peer },
      },
      intl: { locale },
      history,
      location: { pathname },
      data: { privateKey },
    } = this.props

    if (
      !action ||
      ['join', 'connect', 'confirm', 'confirminvoice'].indexOf(action.toLowerCase()) === -1
    ) {
      history.push(localisedUrl(locale, links.notFound))
      return
    }

    action = action.toLowerCase()

    if (action === 'join' || action === 'connect') {
      if (data && data.length == 66) {
        const publicKey = data
        const walletData = actions.btcmultisig.login_USER(privateKey, publicKey, true)

        if (!walletData) {
          history.push(localisedUrl(locale, links.notFound))
          return
        }

        const balance = await actions.btcmultisig.fetchBalance(walletData.address)
        const myPublicKey = this.props.data.publicKey.toString('hex')

        this.setState({
          action,
          wallet: walletData,
          walletBalance: balance,
          peer,
          privateKey,
          publicKey,
          myPublicKey,
          joinLink: `${getFullOrigin()}${links.multisign}/btc/connect/${myPublicKey}`,
        })
        actions.pubsubRoom.onReady(() => {
          this.setState({
            addWalletEnabled: true,
          })
        })
      } else {
        history.push(localisedUrl(locale, links.notFound))
      }
    }
    if (action === 'confirm' || action === 'confirminvoice') {
      if (data && data.length) {
        let txRaw = data
        let invoice = false
        if (action === 'confirminvoice') {
          const dataParts = data.split('|')
          if (dataParts.length === 2) {
            invoice = dataParts[0]
            txRaw = dataParts[1]
          } else {
            console.log('Bad tx raw and invoiceid data')
          }
        }
        if (txRaw.length === 64) {
          setTimeout(() => {
            //@ts-ignore: strictNullChecks
            actions.modals.open(constants.modals.BtcMultisignConfirmTx, {
              txId: txRaw,
              showCloseButton: true,
              onClose: () => {
                history.push(localisedUrl(locale, links.home))
              },
            })
          }, 100)
        } else {
          try {
            this.setState(
              {
                action,
                txData: await actions.btcmultisig.parseRawTX(txRaw),
                invoice,
                txRaw: txRaw,
              },
              () => {
                setTimeout(() => {
                  //@ts-ignore: strictNullChecks
                  actions.modals.open(constants.modals.BtcMultisignConfirmTx, {
                    txData: txRaw,
                    showCloseButton: false,
                    onClose: () => {
                      history.push(localisedUrl(locale, links.home))
                    },
                  })
                }, 100)
              }
            )
          } catch (e) {
            console.log('Bad tx raw data')
          }
        }
      }
    }
  }

  async componentWillUnmount() {
    //@ts-ignore: strictNullChecks
    SwapApp.shared().services.room.unsubscribe(
      'btc multisig join ready',
      this.handleOnlineWalletConnect
    )
    clearTimeout(this.timerWaitOnlineJoin)
  }

  connectWallet = (action) => {
    const { privateKey, publicKey } = this.state
    actions.btcmultisig.addBtcMultisigKey(publicKey, true)

    actions.core.markCoinAsVisible('BTC (Multisig)', true)

    this.setState({
      action: action === 'join' ? 'linkready' : 'ready',
    })
    if (action === 'join') {
      //@ts-ignore: strictNullChecks
      actions.modals.open(constants.modals.MultisignJoinLink, {
        action: `connect`,
        callback: () => {
          this.handleGoToWallet()
        },
        showCloseButton: false,
      })
    }
  }

  handleOnlineWalletConnect = async (_data) => {
    console.log('btc multisig join ready', _data)
    const { fromPeer, data } = _data
    const { peer } = this.state
    if (fromPeer === peer) {
      //@ts-ignore: strictNullChecks
      SwapApp.shared().services.room.unsubscribe(
        'btc multisig join ready',
        this.handleOnlineWalletConnect
      )
      clearTimeout(this.timerWaitOnlineJoin)
      this.connectWallet('ready')
    }
  }

  handleAddWallet = async () => {
    const { action, myPublicKey, publicKey, peer } = this.state

    //If peer is online - try connect via pubsubRoom

    this.setState({
      waitCreateWallet: true,
    })

    actions.pubsubRoom.waitPeer(
      peer,
      () => {
        this.setState({
          action: 'onlinejoin',
        })
        //@ts-ignore: strictNullChecks
        SwapApp.shared().services.room.subscribe(
          'btc multisig join ready',
          this.handleOnlineWalletConnect
        )
        //@ts-ignore: strictNullChecks
        SwapApp.shared().services.room.sendMessagePeer(peer, {
          event: 'btc multisig join',
          data: {
            publicKey: myPublicKey,
            checkKey: publicKey,
          },
        })
        this.timerWaitOnlineJoin = setTimeout(() => {
          //@ts-ignore: strictNullChecks
          SwapApp.shared().services.room.unsubscribe(
            'btc multisig join ready',
            this.handleOnlineWalletConnect
          )
          this.connectWallet(action)
        }, 10000)
      },
      () => {
        this.connectWallet(action)
      },
      10000
    )
  }

  handleSaveMnemonic = async () => {
    //@ts-ignore: strictNullChecks
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = mnemonic === `-`

        this.setState({
          mnemonicSaved,
        })
      },
    })
  }

  handleGoToWallet = async () => {
    const {
      history,
      intl: { locale },
    } = this.props

    const { address } = actions.user.getAuthData('btcMultisigUser')
    history.push(localisedUrl(locale, `/btc/${address}`))
  }

  handleConfirm = async () => {
    const { txRaw, invoice } = this.state
    this.setState({ isConfirming: true })
    //@ts-ignore
    const signedTX = await actions.btcmultisig.signMultiSign(txRaw)
    const txID = await actions.btcmultisig.broadcastTx(signedTX)
    if (invoice) {
      // @ToDo - payer address
      //@ts-ignore
      await actions.invoices.markInvoice(invoice, 'ready', txID)
    }
    this.setState({
      txID,
      action: 'confirmready',
    })
  }

  render() {
    const {
      action,

      wallet,
      walletBalance,
      joinLink,
      addWalletEnabled,
      waitCreateWallet,

      debugShowTXB,
      debugShowInput,
      debugShowOutput,

      mnemonicSaved,
    } = this.state

    return (
      <section>
        {action === 'onlinejoin' && (
          <Fragment>
            <h1>
              <FormattedMessage
                id="BTCMS_CreateWalletTitle"
                defaultMessage="Создание BTC-multisignature кошелька"
              />
            </h1>
            <h3>
              <FormattedMessage
                id="BTCMS_WaitOtherSide"
                defaultMessage="Ожидание второй стороны..."
              />
            </h3>
          </Fragment>
        )}
        {(action === 'join' || action === 'connect') && (
          <Fragment>
            <h1>
              <FormattedMessage
                id="BTCMS_CreateWalletTitle"
                defaultMessage="Создание BTC-multisignature кошелька"
              />
            </h1>

            <div>
              <label>
                <FormattedMessage id="BTCMS_WalletAddress" defaultMessage="Адрес кошелька:" />
              </label>
              <strong>{wallet.address}</strong>
            </div>
            <div>
              <label>
                <FormattedMessage id="BTCMS_WalletBalance" defaultMessage="Баланс" />
              </label>
              <strong> {walletBalance} BTC</strong>
            </div>
            {mnemonicSaved ? (
              <>
                {addWalletEnabled ? (
                  waitCreateWallet ? (
                    <Button brand>
                      <FormattedMessage
                        id="BTCMS_CreateWalletWait"
                        defaultMessage="Создание кошелька... Подождите немного"
                      />
                    </Button>
                  ) : (
                    <Button brand onClick={this.handleAddWallet}>
                      <FormattedMessage
                        id="BTCMS_CreateWalletAdd"
                        defaultMessage="Добавить этот кошелек"
                      />
                    </Button>
                  )
                ) : (
                  <Button brand>
                    <FormattedMessage
                      id="BTCMS_CreateWalletLoading"
                      defaultMessage="Загрузка... Подождите немного"
                    />
                  </Button>
                )}
              </>
            ) : (
              <>
                <div>
                  <strong>
                    <FormattedMessage
                      id="BTCMS_YouNeedSaveMnemonic"
                      defaultMessage="Для активации btc-multisig вы должны сохранить 12 слов"
                    />
                  </strong>
                </div>
                <div>
                  <label>
                    <FormattedMessage
                      id="BTCMS_SaveYourMnemonic"
                      defaultMessage="Пожалуйста сохраните свою секретную фразу."
                    />
                  </label>
                </div>
                <Button brand onClick={this.handleSaveMnemonic}>
                  <FormattedMessage
                    id="BTCMS_SaveMnemonicButton"
                    defaultMessage="Save secret phrase"
                  />
                </Button>
              </>
            )}
          </Fragment>
        )}
        {!mnemonicSaved && (
          <div styleName="descritonText">
            <FormattedMessage
              id="BTCMS_CreateWalletLoading_descroptio"
              defaultMessage="Funds sent to this wallet cannot be spent without your confirmation (please save your private 12 words passphrase)"
            />
          </div>
        )}
        {
          /*action=='confirm' ||*/ action === 'confirminvoice' && (
            <Fragment>
              <h1>
                <FormattedMessage
                  id="BTCMS_ConfirmTxTitle"
                  defaultMessage="Подтверждение транзакции"
                />
              </h1>
              <h3>
                <button
                  onClick={() => {
                    this.setState({ debugShowInput: !debugShowInput })
                  }}
                >
                  <FormattedMessage id="BTCMS_ConfirmTxInputs" defaultMessage="Входы транзакции" />
                </button>
              </h3>
              {debugShowInput && (
                <pre>
                  <code>{JSON.stringify(this.state.txData.input, null, 4)}</code>
                </pre>
              )}
              <h3>
                <button
                  onClick={() => {
                    this.setState({ debugShowOutput: !debugShowOutput })
                  }}
                >
                  <FormattedMessage
                    id="BTCMS_ConfirmTxOutputs"
                    defaultMessage="Выходы транзакции"
                  />
                </button>
              </h3>
              {debugShowOutput && (
                <pre>
                  <code>{JSON.stringify(this.state.txData.output, null, 4)}</code>
                  <code>{JSON.stringify(this.state.txData, null, 4)}</code>
                </pre>
              )}
              <div>
                <Button brand onClick={this.handleConfirm}>
                  <FormattedMessage
                    id="BTCMS_ConfirmTxSign"
                    defaultMessage="Подписать транзакцию"
                  />
                </Button>
              </div>
            </Fragment>
          )
        }
        {action === 'confirmready' && (
          <Fragment>
            <FormattedMessage id="BTCMS_ConfirmTxTitle" defaultMessage="Подтверждение транзакции" />
            <h2>
              <FormattedMessage
                id="BTCMS_ConfirmTxReady"
                defaultMessage="Транзакция подписана и отправлена в блокчейн"
              />
            </h2>
            <div>
              <Button brand onClick={this.handleGoToWallet}>
                <FormattedMessage
                  id="BTCMS_ConfirmTxGoToWallet"
                  defaultMessage="Перейти в кошелек"
                />
              </Button>
            </div>
            <pre>
              <code>{JSON.stringify(this.state.txID, null, 4)}</code>
            </pre>
          </Fragment>
        )}
        {(action === 'linkready' || action === 'ready') && (
          <Fragment>
            <h1>
              <FormattedMessage
                id="BTCMS_CreateWalletTitle"
                defaultMessage="Создание BTC-multisignature кошелька"
              />
            </h1>
            {action === 'linkready' && (
              <h2>
                <FormattedMessage
                  id="BTCMS_CreateWalletLinkReady"
                  defaultMessage="Кошелек создан. Отправьте эту ссылку второму владельцу для подтверждения"
                />
              </h2>
            )}
            {action === 'ready' && (
              <h2>
                <FormattedMessage id="BTCMS_CreateWalletReady" defaultMessage="Кошелек создан" />
              </h2>
            )}
            {action === 'linkready' && <span>{joinLink}</span>}
            <div>
              <Button brand onClick={this.handleGoToWallet}>
                <FormattedMessage
                  id="BTCMS_CreateWalletReadyButton"
                  defaultMessage="Готово. Открыть кошелек"
                />
              </Button>
            </div>
          </Fragment>
        )}
      </section>
    )
  }
}

export default injectIntl(Btc)
