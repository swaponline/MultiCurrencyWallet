import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import React, { Fragment }  from 'react'
import { withRouter } from 'react-router-dom'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import { constants, externalConfig, getCurrencyKey, user } from 'helpers'
import erc20Like from 'common/erc20Like'
import getCoinInfo from 'common/coins/getCoinInfo'
import styles from '../Styles/default.scss'
import ownStyles from './ReceiveModal.scss'
import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import Copy from 'components/ui/Copy/Copy'

const langPrefix = `ReceiveModal`
const langs = defineMessages({
  title: {
    id: 'Receive',
    defaultMessage: 'Receive',
  },
  needSaveMnemonicToContinue: {
    id: `${langPrefix}_YouNeedSaveMnemonic`,
    defaultMessage: `Вы должны сохранить 12 слов.`,
  },
  pleaseSaveMnemonicToContinue: {
    id: `${langPrefix}_SaveYourMnemonic`,
    defaultMessage: `Пожалуйста сохраните свою секретную фразу.`
  },
  buttonSaveMnemonic: {
    id: `${langPrefix}_ButtonSaveMnemonic`,
    defaultMessage: `Save`,
  },
  buttonCancel: {
    id: `${langPrefix}_ButtonCancel`,
    defaultMessage: `Cancel`,
  },
})

@withRouter
@cssModules({ ...styles, ...ownStyles }, { allowMultiple: true })
class ReceiveModal extends React.Component<any, any> {
  constructor(props) {
    super(props)
    const {
      data: {
        address,
        currency,
        standard,
      },
    } = props

    let howToDeposit = ''

    if (
      standard
      && externalConfig[standard]
      && externalConfig[standard][currency.toLowerCase()]
      && externalConfig[standard][currency.toLowerCase()].howToDeposit
    ) {
      howToDeposit = externalConfig[standard][currency.toLowerCase()].howToDeposit
    }

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = (mnemonic === `-`)

    howToDeposit = howToDeposit.replace(/{userAddress}/g, address);

    const targetCurrency = getCurrencyKey(currency.toLowerCase(), true)

    const isToken = erc20Like.isToken({ name: currency })
    const recieveUrl = (isToken ? '/token' : '') + `/${targetCurrency}/${address}/receive`

    const {
      tokenSymbol,
      tokenBlockchain,
    } = ((currency, isToken) => {
      if (isToken) {
        const tokenInfo = getCoinInfo(currency)
        return {
          tokenSymbol: tokenInfo.coin,
          tokenBlockchain: tokenInfo.blockchain,
        }
      } else {
        return { tokenSymbol: ``, tokenBlockchain: `` }
      }
    })(currency, isToken)

    props.history.push(recieveUrl)

    this.state = {
      step: (mnemonicSaved) ? 'receive' : 'saveMnemonic',
      howToDeposit,
      isToken,
      tokenSymbol,
      tokenBlockchain,
    }
  }

  handleBeginSaveMnemonic = async () => {
    actions.modals.open(constants.modals.SaveWalletSelectMethod, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = (mnemonic === `-`)
        const step = (mnemonicSaved) ? 'receive' : 'saveMnemonicWords'

        this.setState({
          mnemonicSaved,
          step,
        })
      }
    })
  }

  handleClose = () => {
    const { name, history: { location: { pathname }, goBack } } = this.props

    if (pathname.includes('receive')) {
      goBack()
    }

    actions.modals.close(name)
  }

  render() {
    const {
      intl: { locale },
      name,
      intl,
      data: { currency, address },
    } = this.props

    const {
      howToDeposit,
      step,
      isToken,
      tokenSymbol,
      tokenBlockchain,
    } = this.state

    const externalExchangeLink = user.getExternalExchangeLink({ address, currency, locale })

    return (
      <Modal name={name} title={intl.formatMessage(langs.title)}>
        <div styleName="content">
          {step === 'receive' && (
            <Fragment>
              {howToDeposit && (
                <div styleName="depositInstruction">
                  <h5 styleName="title">
                    <FormattedMessage id="howToDeposit" defaultMessage="How to deposit" />:
                  </h5>
                  <p styleName="description" dangerouslySetInnerHTML={{ __html: howToDeposit }} />
                </div>
              )}

              <p style={{ fontSize: 25 }}>
                {isToken ? (
                  <FormattedMessage
                    id="ReceiveModal_TokenAddress"
                    defaultMessage="This is your {tokenSymbol} address on the {tokenBlockchain} blockchain"
                    values={{
                      tokenSymbol,
                      tokenBlockchain,
                    }}
                  />
                ) : (
                  <FormattedMessage
                    id="ReceiveModal50"
                    defaultMessage="This is your {currency} address"
                    values={{ currency: `${currency.toUpperCase()}` }}
                  />
                )}
              </p>
              <Copy text={address}>
                <div styleName="qr">
                  <QR address={address} />

                  <p styleName="address">{address}</p>

                  <div styleName="sendBtnsWrapper">
                    <div styleName="actionBtn">
                      <Button big brand fill>
                        <FormattedMessage id="recieved67" defaultMessage="Copy to clipboard" />
                      </Button>
                    </div>
                    <div styleName="actionBtn">
                      <Button big gray fill onClick={this.handleClose}>
                        <FormattedMessage id="WithdrawModalCancelBtn" defaultMessage="Cancel" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Copy>

              {externalExchangeLink && (
                <div styleName="fiatDepositRow">
                  <a href={externalExchangeLink} target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="buyByCreditCard" defaultMessage="buy using credit card" />
                  </a>
                </div>
              )}
            </Fragment>
          )}
          {step === 'saveMnemonic' && (
            <Fragment>
              <div styleName="content-overlay">
                <p styleName="centerInfoBlock">
                  <strong>
                    <FormattedMessage {...langs.needSaveMnemonicToContinue} />
                  </strong>
                  <br />
                  <FormattedMessage {...langs.pleaseSaveMnemonicToContinue} />
                </p>
              </div>

              <div styleName="buttonsHolder buttonsHolder_2_buttons button-overlay">
                <Button blue onClick={this.handleBeginSaveMnemonic}>
                  <FormattedMessage {...langs.buttonSaveMnemonic} />
                </Button>
                <Button gray onClick={this.handleClose}>
                  <FormattedMessage {...langs.buttonCancel} />
                </Button>
              </div>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(ReceiveModal)