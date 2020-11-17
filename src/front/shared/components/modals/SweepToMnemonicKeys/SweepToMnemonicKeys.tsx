import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './SweepToMnemonicKeys.scss'
import finishSvg from './images/finish.svg'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'
import CopyToClipboard from 'react-copy-to-clipboard'

import links from 'helpers/links'


const langPrefix = `SweepToMnemonicKeys`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Sweep`,
  },
  Continue: {
    id: `${langPrefix}_Continue`,
    defaultMessage: `Продолжить`,
  },
  Ready: {
    id: `${langPrefix}_Ready`,
    defaultMessage: `Готово`,
  },
  Cancel: {
    id: `${langPrefix}_Cancel`,
    defaultMessage: `Отмена`,
  },
  noticeRestoreOld: {
    id: `${langPrefix}_NoticeRestoreOld`,
    defaultMessage: `Вы уже произвели переход на 12 слов. Сдесь вы можете восстановить доступ к своим старым кошелькам`,
  },
  noticeMakeSweep: {
    id: `${langPrefix}_NoticeMakeSweep`,
    defaultMessage: `Пожалуйста, переместите все средства на кошельки помеченные "new" (USDT и остальные токены переведите на Ethereum адрес). Затем нажмите кнопку "SWEEP". Старые адреса будут скрыты.`,
  },
  buttonRestore: {
    id: `${langPrefix}_ButtonRestoreOld`,
    defaultMessage: `Восстановить`,
  },
  buttonMakeSweep: {
    id: `${langPrefix}_ButtonMakeSweep`,
    defaultMessage: `Done`,
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
export default class SweepToMnemonicKeys extends React.Component<any, any> {

  props: any

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    const btcMnemonicKey = localStorage.getItem(constants.privateKeyNames.btcMnemonic)
    const btcKey = localStorage.getItem(constants.privateKeyNames.btc)

    console.log('Is Sweep Ready', (btcMnemonicKey === btcKey))
    this.state = {
      step: `begin`,
      isSweepReady: (btcMnemonicKey === btcKey)
    }
  }

  handleGoToWallet = () => {
    this.handleClose()
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

  handleFinish = () => {
    this.handleClose()
    window.location.hash = '#/'
    window.location.reload()
  }

  handleMakeSweep = () => {
    const oldBtc = localStorage.getItem(constants.privateKeyNames.btc)
    const oldEth = localStorage.getItem(constants.privateKeyNames.eth)
    const oldBtcSMS = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKey)
    const oldBtcMS = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKey)

    const newBtc = localStorage.getItem(constants.privateKeyNames.btcMnemonic)
    const newEth = localStorage.getItem(constants.privateKeyNames.ethMnemonic)
    const newBtcSMS = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyMnemonic)
    const newBtcMS = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic)

    // backup current keys
    if (oldBtc) localStorage.setItem(constants.privateKeyNames.btcOld, oldBtc)
    if (oldEth) localStorage.setItem(constants.privateKeyNames.ethOld, oldEth)
    if (oldBtcSMS) localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyOld, oldBtcSMS)
    if (oldBtcMS) localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyOld, oldBtcMS)

    // Switch to mnemonic
    if (newBtc) localStorage.setItem(constants.privateKeyNames.btc, newBtc)
    if (newEth) localStorage.setItem(constants.privateKeyNames.eth, newEth)
    if (newBtcSMS) localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKey, newBtcSMS)
    if (newBtcMS) localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, newBtcMS)

    //@ts-ignore
    localStorage.setItem(constants.localStorage.isSweepReady, true)
    console.log('Old', oldBtc, oldEth, oldBtcSMS, oldBtcMS)
    console.log('New', newBtc, newEth, newBtcSMS, newBtcMS)

    const { data } = this.props

    if (data
      && data.onSweep
      && data.onSweep instanceof Function
    ) {
      data.onSweep()
    }

    this.setState({
      step: `ready`,
    })
  }

  handleRestoreOld = () => {
    const oldBtc = localStorage.getItem(constants.privateKeyNames.btcOld)
    const oldEth = localStorage.getItem(constants.privateKeyNames.ethOld)
    const oldBtcSMS = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyOld)
    const oldBtcMS = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyOld)

    const mnemonicBtc = localStorage.getItem(constants.privateKeyNames.btc)
    const mnemonicEth = localStorage.getItem(constants.privateKeyNames.eth)
    const mnemonicBtcSMS = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKey)
    const mnemonicBtcMS = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKey)

    // backup mnemonic keys
    if (mnemonicBtc) localStorage.setItem(constants.privateKeyNames.btcMnemonic, mnemonicBtc)
    if (mnemonicEth) localStorage.setItem(constants.privateKeyNames.ethMnemonic, mnemonicEth)
    if (mnemonicBtcSMS) localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyMnemonic, mnemonicBtcSMS)
    if (mnemonicBtcMS) localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic, mnemonicBtcMS)

    // Switch to old keys
    if (oldBtc) localStorage.setItem(constants.privateKeyNames.btc, oldBtc)
    if (oldEth) localStorage.setItem(constants.privateKeyNames.eth, oldEth)
    if (oldBtcSMS) localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKey, oldBtcSMS)
    if (oldBtcMS) localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, oldBtcMS)

    console.log('Old', oldBtc, oldEth, oldBtcSMS, oldBtcMS)
    console.log('Mnemonic', mnemonicBtc, mnemonicEth, mnemonicBtcSMS, mnemonicBtcMS)
    this.setState({
      step: `ready`,
    })
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
      isSweepReady,
    } = this.state


    return (
      <Modal name={name} title={`${intl.formatMessage(langLabels.title)}`} onClose={this.handleClose} showCloseButton={(step === `ready`) ? false : showCloseButton}>
        { step === `begin` && (
          <p styleName="notice">
            <FormattedMessage {...langLabels[(isSweepReady) ? `noticeRestoreOld` : `noticeMakeSweep`]} />
          </p>
        )}
        <div>
          {step === `begin` && (
            <Fragment>
              <div styleName="buttonsHolder">
                <Button blue onClick={this.handleClose}>
                  <FormattedMessage { ...langLabels.Cancel } />
                </Button>
                <Button blue onClick={(isSweepReady) ? this.handleRestoreOld : this.handleMakeSweep}>
                  <FormattedMessage { ...langLabels[(isSweepReady) ? `buttonRestore` : `buttonMakeSweep`] } />
                </Button>
              </div>
            </Fragment>
          )}
          {step === `ready` && (
            <Fragment>
              <p styleName="notice">
                <img styleName="finishImg" src={finishSvg} alt="finish" />
                { /* <FormattedMessage {...langLabels.readySaveNotice} /> */ }
              </p>
              <div styleName="lowLevel">
                {/*
                //@ts-ignore */}
                <Button
                  styleName="buttonCenter buttonHalfFullWidth"
                  blue
                  onClick={this.handleFinish}
                >
                  <FormattedMessage {...langLabels.Ready} />
                </Button>
              </div>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}
