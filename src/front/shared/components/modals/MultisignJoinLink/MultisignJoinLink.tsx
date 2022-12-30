import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { constants } from 'helpers'
import actions from 'redux/actions'
import { connect } from 'redaction'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './MultisignJoinLink.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import { ShareLink } from 'components/controls'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import links from 'helpers/links'
import { getFullOrigin } from 'helpers/links'

import SwapApp from 'swap.app'


const langLabels = defineMessages({
  multiSignJoinLinkMessage: {
    id: 'multiSignJoinLinkMessage',
    defaultMessage: `Отправьте эту ссылку второму владельцу кошелька`,
  },
  multiSignJoinLink: {
    id: 'multiSignJoinLink',
    defaultMessage: `Создание BTC-Multisign кошелька`,
  },
  needSaveMnemonicToContinue: {
    id: 'multiSignJoinLink_YouNeedSaveMnemonic',
    defaultMessage: `Для активации btc-multisig вы должны сохранить 12 слов.`,
  },
  pleaseSaveMnemonicToContinue: {
    id: 'multiSignJoinLink_SaveYourMnemonic',
    defaultMessage: `Пожалуйста сохраните свою секретную фразу.`
  },
  buttonSaveMnemonic: {
    id: 'multiSignJoinLink_ButtonSaveMnemonic',
    defaultMessage: `Save`,
  },
  buttonCancel: {
    id: 'multiSignJoinLink_ButtonCancel',
    defaultMessage: `Cancel`,
  },
})

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
class MultisignJoinLink extends React.Component<any, any> {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicSaved = (mnemonic === `-`)

    this.state = {
      joinLink: '',
      mnemonicSaved,
      step: (mnemonicSaved) ? 'link' : 'savemnemonic',
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
    const linkAction = action || `join`

    //@ts-ignore: strictNullChecks
    const joinLink = `${getFullOrigin()}${links.multisign}/btc/${linkAction}/${publicKey}/${SwapApp.shared().services.room.peer}`

    this.setState(() => ({
      joinLink,
    }))
  }

  handleBeginSaveMnemonic = async () => {
    actions.modals.open(constants.modals.SaveWalletSelectMethod, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicSaved = (mnemonic === `-`)
        const step = (mnemonicSaved) ? 'link' : 'savemnemonic'

        this.setState({
          mnemonicSaved,
          step,
        })
      }
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
    const {
      name,
      data: {
        callback,
      },
    } = this.props

    actions.modals.close(name)

    if (callback && callback instanceof Function) {
      callback()
    }
  }

  render() {
    const { name, intl } = this.props
    const {
      joinLink,
      isLinkCopied,
      step,
    } = this.state

    const {
      data: {
        showCloseButton,
      },
    } = this.props

    return (
      //@ts-ignore: strictNullChecks
      <Modal name={name} title={`${intl.formatMessage(langLabels.multiSignJoinLink)}`} onClose={this.handleClose} showCloseButton={showCloseButton}>
        {step === 'savemnemonic' && (
          <Fragment>
            <div styleName="content-overlay">
              <p styleName="centerInfoBlock">
                <strong>
                  <FormattedMessage {...langLabels.needSaveMnemonicToContinue} />
                </strong>
                <br />
                <FormattedMessage {...langLabels.pleaseSaveMnemonicToContinue} />
              </p>
            </div>

            <div styleName="buttonsHolder buttonsHolder_2_buttons button-overlay">
              <Button blue onClick={this.handleBeginSaveMnemonic}>
                <FormattedMessage {...langLabels.buttonSaveMnemonic} />
              </Button>
              <Button gray onClick={this.handleClose}>
                <FormattedMessage {...langLabels.buttonCancel} />
              </Button>
            </div>
          </Fragment>
        )}
        {step === 'link' && (
          <Fragment>
            <p styleName="notice">
              <FormattedMessage { ... langLabels.multiSignJoinLinkMessage } />
            </p>
            <div className="ym-hide-content">
              <ShareLink link={joinLink} fullSize={true} />
            </div>
            <hr />
            <Button blue styleName="finishButton" fullWidth onClick={this.handleFinish}>
              <FormattedMessage id="BTCMS_CreateWalletReadyButton" defaultMessage="Готово. Открыть кошелек" />
            </Button>
          </Fragment>
        )}
      </Modal>
    )
  }
}

export default injectIntl(MultisignJoinLink)
