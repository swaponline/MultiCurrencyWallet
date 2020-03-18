import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './RestoryMnemonicWallet.scss'
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

import links from 'helpers/links'


const langPrefix = `RestoryMnemonicWallet`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Восстановление кошелка из секретной фразы`,
  },
  mnemonicLabel: {
    id: `${langPrefix}_MnemonicField`,
    defaultMessage: `Секретная фраза (12 слов):`,
  },
  mnemonicPlaceholder: {
    id: `${langPrefix}_MnemonicPlaceholder`,
    defaultMessage: `Введите сохраненную фразу, для восстановления кошелька`,
  },
  readyNotice: {
    id: `${langPrefix}_ReadyNotice`,
    defaultMessage: `Теперь вы можете добавить BTC, ETH и другие валюты`,
  },
  Ready: {
    id: `${langPrefix}_Ready`,
    defaultMessage: `Готово`,
  },
  restoringWallet: {
    id: `${langPrefix}_RestroringWallet`,
    defaultMessage: `Восстанавливаем...`,
  },
  restoryWallet: {
    id: `${langPrefix}_RestoryWallet`,
    defaultMessage: `Восстановить`,
  },
  cancelRestory: {
    id: `${langPrefix}_CancelRestory`,
    defaultMessage: `Отмена`,
  },
  mnemonicInvalid: {
    id: `${langPrefix}_MnemonicInvalid`,
    defaultMessage: `Вы указали не валидный набор слов`,
  },
})

@injectIntl
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
export default class RestoryMnemonicWallet extends React.Component {
  
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      step: `enter`,
      mnemonic: '',
      mnemonicIsInvalid: false,
      isFetching: false,
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

  handleFinish = () => {
    this.handleClose()
  }

  handleRestoryWallet = () => {
    const { mnemonic } = this.state

    if (!mnemonic || !actions.btc.validateMnemonicWords(mnemonic)) {
      this.setState({
        mnemonicIsInvalid: true,
        isFetching: false,
      })
      return
    }

    this.setState({
      isFetching: true,
    }, async () => {
      const btcWallet = await actions.btc.getWalletByWords(mnemonic)
      const ethWallet = await actions.eth.getWalletByWords(mnemonic)
      
      await actions.btc.login(false,mnemonic)
      await actions.eth.login(false,mnemonic)
      this.setState({
        isFetching: false,
        step: `ready`,
      })
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
      mnemonic,
      mnemonicIsInvalid,
      isFetching,
    } = this.state

    const linked = Link.all(this, 'mnemonic')

    return (
      <Modal name={name} title={`${intl.formatMessage(langLabels.title)}`} onClose={this.handleClose} showCloseButton={showCloseButton}>
        <div>
          {step === `enter` && (
            <Fragment>
              {(mnemonic && mnemonicIsInvalid) && (
                <div styleName='rednotes mnemonicNotice'>
                  <FormattedMessage { ...langLabels.mnemonicInvalid } />
                </div>
              )}
              <div styleName="highLevel" className="ym-hide-content">
                <FieldLabel label>
                  <FormattedMessage {...langLabels.mnemonicLabel} />
                </FieldLabel>
                <Input
                  styleName="input inputMargin25 for12words"
                  valueLink={linked.mnemonic}
                  multiline={true}
                  placeholder={`${intl.formatMessage(langLabels.mnemonicPlaceholder)}`}
                />
              </div>
              <div styleName="buttonsHolder">
                <Button 
                  blue 
                  disabled={(!mnemonic || isFetching)} 
                  onClick={this.handleRestoryWallet}
                >
                  {isFetching ? (
                    <FormattedMessage { ...langLabels.restoringWallet } />
                  ) : (
                    <FormattedMessage { ...langLabels.restoryWallet } />
                  )}
                </Button>
                <Button blue onClick={this.handleClose}>
                  <FormattedMessage { ...langLabels.cancelRestory } />
                </Button>
              </div>
            </Fragment>
          )}
          {step === `ready` && (
            <Fragment>
              <p styleName="notice mnemonicNotice">
                <img styleName="finishImg" src={finishSvg} alt="finish" />
                <FormattedMessage {...langLabels.readyNotice} />
              </p>
              <div styleName="lowLevel">
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