import React, { Fragment }  from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'
import erc20Like from 'common/erc20Like'
import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyles from './ReceiveModal.scss'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import Copy from 'components/ui/Copy/Copy'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import config from 'helpers/externalConfig'
import getCurrencyKey from 'helpers/getCurrencyKey'
import { getItezUrl } from 'helpers'


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

@connect(
  ({ user }) => ({ user })
)
@withRouter
@cssModules({ ...styles, ...ownStyles }, { allowMultiple: true })
class ReceiveModal extends React.Component<any, any> {
  constructor(props) {
    super(props)
    const {
      data: {
        address,
        currency,
      },
    } = props

    let howToDeposit = ''
    if (config
      && config.erc20
      && config.erc20[currency.toLowerCase()]
      && config.erc20[currency.toLowerCase()].howToDeposit
    ) howToDeposit = config.erc20[currency.toLowerCase()].howToDeposit

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = (mnemonic === `-`)

    howToDeposit = howToDeposit.replace(/{userAddress}/g, address);

    const targetCurrency = getCurrencyKey(currency.toLowerCase(), true)
    const isToken = erc20Like.isToken({ name: currency })
    const recieveUrl = (isToken ? '/token' : '') + `/${targetCurrency}/${address}/receive`
    
    props.history.push(recieveUrl)

    this.state = {
      step: (mnemonicSaved) ? 'reveive' : 'saveMnemonic',
      howToDeposit,
    }
  }

  handleBeginSaveMnemonic = async () => {
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = (mnemonic === `-`)
        const step = (mnemonicSaved) ? 'reveive' : 'saveMnemonicWords'

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
      props: {
        user,
        intl: { locale },
        name,
        intl,
        data: {
          currency,
          address,
        },
      },
      state: {
        howToDeposit,
        step,
        mnemonicSaved,
      },
    } = this

    const buyViaCreditCardLink = (
      config
      && config.opts
      && config.opts.buyViaCreditCardLink
    ) ? config.opts.buyViaCreditCardLink : false

    if (howToDeposit) {
      return (
        //@ts-ignore: strictNullChecks
        <Modal name={name} title={intl.formatMessage(langs.title)}>
          <div dangerouslySetInnerHTML={{ __html: howToDeposit }} />
        </Modal>
      )
    }

    return (
      //@ts-ignore: strictNullChecks
      <Modal name={name} title={intl.formatMessage(langs.title)}>
        <div styleName="content">
          {step === 'reveive' && (
            <Fragment>
              <p style={{ fontSize: 25 }}>
                <FormattedMessage id="ReceiveModal50" defaultMessage="This is your {currency} address" values={{ currency: `${currency}` }} />
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
              {currency.includes("BTC") && buyViaCreditCardLink && (
                <div styleName="fiatDepositRow">
                  <a href={getItezUrl({ user, locale, url: buyViaCreditCardLink })} target="_blank" rel="noopener noreferrer">
                    <FormattedMessage
                      id="buyByCreditCard"
                      defaultMessage="buy using credit card"
                    />
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