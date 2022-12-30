import React, { Fragment } from 'react'
import { BigNumber } from 'bignumber.js'
import { constants } from 'helpers'
import actions from 'redux/actions'
import config from 'app-config'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './RestoryMnemonicWallet.scss'
import okSvg from 'shared/images/ok.svg'
import * as mnemonicUtils from 'common/utils/mnemonic'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import links from 'helpers/links'

import MnemonicInput from 'components/forms/MnemonicInput/MnemonicInput'
import feedback from 'shared/helpers/feedback'


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

type ComponentProps = {
  name: string
  onClose: () => void
  intl: IUniversalObj

  data: {
    onClose: () => void
    noRedirect?: boolean
  }
}

type ComponentState = {
  mnemonic: string
  step: string
  mnemonicIsInvalid: boolean
  isFetching: boolean
}

@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
class RestoryMnemonicWallet extends React.Component<ComponentProps, ComponentState> {
  constructor(props) {
    super(props)

    this.state = {
      step: `enter`,
      mnemonic: '',
      mnemonicIsInvalid: false,
      isFetching: false,
    }
  }

  componentDidMount() {
    feedback.restore.started()
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (data && typeof data.onClose === 'function') {
      data.onClose()
    } else if (!(data && data.noRedirect)) {
      window.location.assign(links.hashHome)
    }

    actions.modals.close(name)
  }

  handleFinish = () => {
    const { data } = this.props

    this.handleClose()

    if (!(data && data.noRedirect)) {
      window.location.assign(links.hashHome)
      window.location.reload()
    }
  }

  handleRestoryWallet = () => {
    const { mnemonic } = this.state

    if (!mnemonic || !mnemonicUtils.validateMnemonicWords(mnemonic)) {
      this.setState({
        mnemonicIsInvalid: true,
        isFetching: false,
      })
      return
    }

    this.setState(() => ({
      isFetching: true,
    }), () => {
      this.restoreWallet(mnemonic)
    })
  }

  restoreWallet = (mnemonic) => {
    // callback in timeout doesn't block ui
    setTimeout(async () => {
      await actions.user.restoreWallet(mnemonic)
      this.setState(() => ({
        isFetching: false,
        step: `ready`,
      }))

      feedback.restore.finished()
    })
  }

  handleMnemonicChange = (mnemonic) => {
    this.setState({
      mnemonic,
    })
  }

  render() {
    const { name, intl } = this.props

    const {
      step,
      mnemonic,
      mnemonicIsInvalid,
      isFetching,
    } = this.state

    return (
      <Modal
        name={name}
        title={`${intl.formatMessage(langLabels.title)}`}
        onClose={this.handleClose}
        showCloseButton={true}
      >
        <div styleName="restoreModalHolder">
          {step === `enter` && (
            <Fragment>
              {mnemonic && mnemonicIsInvalid && (
                <div styleName="rednotes mnemonicNotice">
                  <FormattedMessage {...langLabels.mnemonicInvalid} />
                </div>
              )}
              <div styleName="highLevel" className="ym-hide-content notranslate" translate="no">
                <FieldLabel>
                  <span styleName="tooltipWrapper">
                    <FormattedMessage {...langLabels.mnemonicLabel} />
                    &nbsp;
                    <Tooltip id="ImportKeys_RestoreMnemonic_tooltip">
                      <>
                        <FormattedMessage
                          id="ImportKeys_RestoreMnemonic_Tooltip"
                          defaultMessage="12-word backup phrase"
                        />
                        <br />
                        <br />
                        <div styleName="alertTooltipWrapper">
                          <FormattedMessage
                            id="ImportKeys_RestoreMnemonic_Tooltip_withBalance"
                            defaultMessage="Please, be causious!"
                          />
                        </div>
                      </>
                    </Tooltip>
                  </span>
                </FieldLabel>
                <MnemonicInput 
                  autoFill={config.entry === 'testnet'}
                  onChange={this.handleMnemonicChange}
                />
              </div>
              <div styleName="buttonsHolder">
                <Button gray onClick={this.handleClose}>
                  <FormattedMessage {...langLabels.cancelRestory} />
                </Button>
                <Button
                  id='walletRecoveryButton'
                  blue
                  disabled={!mnemonic || mnemonic.split(' ').length !== 12 || isFetching}
                  onClick={this.handleRestoryWallet}
                >
                  {isFetching ? (
                    <FormattedMessage {...langLabels.restoringWallet} />
                  ) : (
                    <FormattedMessage {...langLabels.restoryWallet} />
                  )}
                </Button>
              </div>
            </Fragment>
          )}
          {step === `ready` && (
            <Fragment>
              <p styleName="notice mnemonicNotice">
                <img styleName="finishImg" src={okSvg} alt="finish" />
                <FormattedMessage {...langLabels.readyNotice} />
              </p>
              <div styleName="lowLevel">
                <Button
                  id='finishWalletRecoveryButton'
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

export default injectIntl(RestoryMnemonicWallet)
