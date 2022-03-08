import React, { Fragment } from 'react'
import { constants } from 'helpers'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'
import { connect } from 'redaction'
import config from 'helpers/externalConfig'
import { getActivatedCurrencies } from 'helpers/user'

import cssModules from 'react-css-modules'

import okSvg from 'shared/images/ok.svg'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import Copy from 'components/ui/Copy/Copy'

import links from 'helpers/links'
import feedback from 'shared/helpers/feedback'
import styles from './SaveMnemonicModal.scss'
import defaultStyles from '../Styles/default.scss'

const langPrefix = `SaveMnemonicModal`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Ваша секретная фраза`,
  },
  enterMnemonicNotice: {
    id: `${langPrefix}_EnterNotice`,
    defaultMessage: `Нажмите слова, чтобы поместить их рядом друг с другом в правильном порядке`,
  },
  shareMnemonicTitle: {
    id: `${langPrefix}_ShareMnemonicTitle`,
    defaultMessage: `Ваша секретная фраза`,
  },
  showMnemonicNotice: {
    id: `${langPrefix}_ShowMnemonicNotice`,
    defaultMessage: `Запишите эти слова в правильном порядке и сохраните их в безопасном месте.`,
  },
  readySaveNotice: {
    id: `${langPrefix}_ReadySaveNotice`,
    defaultMessage: `Храните бумагу в том месте, где вы не забудете`,
  },
  saveMnemonicStep1: {
    id: `${langPrefix}_SaveMnemonicStep1`,
    defaultMessage: `1. Запишите фразу на бумагу`,
  },
  saveMnemonicStep2: {
    id: `${langPrefix}_SaveMnemonicStep2`,
    defaultMessage: `2. Обязательно подпишите что это ключ от {domain}`,
  },
  mnemonicDeleted: {
    id: `${langPrefix}_MnemoniceDeleted`,
    defaultMessage: `You have already saved your 12-words seed. {href}`,
    values: { 
      href: (
        <Link to={links.savePrivateKeys}>
          {' '}
          <FormattedMessage id="MnemoniceDeleted_hrefText" defaultMessage="Try export private key" />
        </Link>
      ) 
    },
  },
  beginNotice: {
    id: `${langPrefix}_BeginNotice`,
    defaultMessage: `Сейчас мы вам покажем 12 слов вашей секретной фразы.{br}Если вы ее потеряете мы не сможем восстановить ваш кошелек`,
  },
  beginContinue: {
    id: `${langPrefix}_BeginContinue`,
    defaultMessage: `Я понимаю`,
  },
  beginLater: {
    id: `${langPrefix}_BeginLater`,
    defaultMessage: `Я сохраню позже`,
  },
})

type MnemonicModalProps = {
  intl: IUniversalObj
  name: string
  onClose: () => void
  data: {
    onClose: () => void
  }
}

type MnemonicModalState = {
  step: string
  mnemonic: string | null
  words: string[]
  enteredWords: string[]
  randomWords: string[]
  mnemonicInvalid: boolean
  incorrectWord: boolean
}

@connect(
  ({
    user: { btcMultisigUserData },
  }) => ({
    btcData: btcMultisigUserData,
  }),
)
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
class SaveMnemonicModal extends React.Component<MnemonicModalProps, MnemonicModalState> {
  constructor(props) {
    super(props)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

    const randomWords = (mnemonic && mnemonic !== '-') ? mnemonic.split(` `) : []
    randomWords.sort(() => 0.5 - Math.random())

    const words = (mnemonic && mnemonic !== '-') ? mnemonic.split(` `) : []

    this.state = {
      step: (mnemonic === '-') ? `removed` : `begin`,
      mnemonic,
      words,
      enteredWords: [],
      randomWords,
      mnemonicInvalid: true,
      incorrectWord: false,
    }
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (data && typeof data.onClose === 'function') {
      data.onClose()
    } else {
      window.location.assign(links.hashHome)
    }

    const addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase = config?.opts?.addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase

    if (addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase) {
      const currencies = getActivatedCurrencies()
      currencies.forEach((currency) => {
        actions.core.markCoinAsVisible(currency.toUpperCase(), true)
      })
      localStorage.setItem(constants.localStorage.isWalletCreate, 'true')
    }

    actions.modals.close(name)
  }

  handleFinish = () => {
    feedback.backup.finished()
    this.handleClose()
  }

  handleGoToConfirm = () => {
    this.setState({
      step: `confirmMnemonic`,
    })
  }

  handleClickWord = (index) => {
    const {
      randomWords,
      enteredWords,
      words,
      mnemonic,
    } = this.state

    const currentWord = enteredWords.length

    if (words[currentWord] !== randomWords[index]) {

      this.setState({
        incorrectWord: true,
      }, () => {
        setTimeout(() => {
          this.setState({
            incorrectWord: false,
          })
        }, 500)
      })
      return
    }

    const clickedWord = randomWords.splice(index, 1)
    enteredWords.push(...clickedWord)

    this.setState({
      randomWords,
      enteredWords,
      incorrectWord: false,
      mnemonicInvalid: (enteredWords.join(` `) !== mnemonic),
    }, () => {
      if (randomWords.length === 0) {
        localStorage.setItem(constants.privateKeyNames.twentywords, '-')
        actions.backupManager.serverCleanupSeed()

        this.setState({
          step: `ready`,
        })
      }
    })
  }

  render() {
    const {
      name,
      intl,
    } = this.props

    const {
      step,
      words,
      enteredWords,
      mnemonic,
      randomWords,
      mnemonicInvalid,
      incorrectWord,
    } = this.state

    return (
      // @ts-ignore: strictNullChecks
      <Modal
        name={name}
        title={`${intl.formatMessage(langLabels.title)}`}
        onClose={this.handleClose}
        showCloseButton
      >
        {step === `confirmMnemonic` && (
          <p styleName="notice mnemonicNotice">
            <FormattedMessage {...langLabels.enterMnemonicNotice} />
          </p>
        )}
        {step === `show` && (
          <p styleName="notice mnemonicNotice">
            <FormattedMessage {...langLabels.showMnemonicNotice} />
          </p>
        )}
        {step === `removed` && (
          <p styleName="notice mnemonicNotice">
            <FormattedMessage {...langLabels.mnemonicDeleted} />
          </p>
        )}
        <div>
          {step === `begin` && (
            <>
              <p styleName="notice mnemonicNotice">
                <FormattedMessage
                  {...langLabels.beginNotice}
                  values={{
                    br: <br />,
                  }} />
              </p>
              <div styleName="buttonsHolder">
                <Button
                  blue
                  onClick={() => {
                    feedback.backup.started()
                    this.setState({ step: `show` })
                  }}>
                  <FormattedMessage {...langLabels.beginContinue} />
                </Button>
                <Button blue onClick={this.handleClose}>
                  <FormattedMessage {...langLabels.beginLater} />
                </Button>
              </div>
            </>
          )}
          {step === `ready` && (
            <>
              <p styleName="notice mnemonicNotice">
                <img styleName="finishImg" src={okSvg} alt="finish" />
                <FormattedMessage {...langLabels.readySaveNotice} />
              </p>
              <div styleName="lowLevel">
                <Button
                  styleName="buttonCenter buttonHalfFullWidth"
                  blue
                  onClick={this.handleFinish}
                >
                  <FormattedMessage id="WithdrawMSUserFinish" defaultMessage="Ready" />
                </Button>
              </div>
            </>
          )}
          {step === `confirmMnemonic` && (
            <>
              <div styleName="highLevel">
                <div styleName={`mnemonicView mnemonicEnter ${(incorrectWord) ? 'mnemonicError' : ''}`}>
                  {
                    enteredWords.map((word, index) => (
                      <button key={index} onClick={() => { }} className="ym-hide-content notranslate" translate="no" type="button">
                        {word}
                      </button>
                    ))
                  }
                </div>
                <div styleName="mnemonicWords">
                  {
                    randomWords.map((word, index) => (
                      <button key={index} onClick={() => this.handleClickWord(index)} className="ym-hide-content notranslate" translate="no" type="button">
                        {word}
                      </button>
                    ))
                  }
                </div>
              </div>
              <div styleName="lowLevel">
                <Button
                  styleName="buttonCenter buttonHalfFullWidth"
                  blue
                  disabled={mnemonicInvalid}
                  onClick={this.handleFinish}
                >
                  <FormattedMessage id="WithdrawMSUserFinish" defaultMessage="Ready" />
                </Button>
              </div>
            </>
          )}
          {step === `show` && (
            <>
              <div styleName="highLevel">
                <div styleName="mnemonicView" className="ym-hide-content notranslate" translate="no">
                  {
                    words.map((word, index) => (
                      <div key={index} styleName="mnemonicViewWordWrapper">
                        <div>
                          <span styleName="wordIndex">{(index + 1)}</span>
                          <span>{word}</span>
                        </div>
                        {
                          /* space for correct copy-paste */
                          index + 1 !== words.length && ' '
                        }
                      </div>
                    ))
                  }
                </div>
                <p styleName="notice mnemonicNotice">
                  <FormattedMessage {...langLabels.saveMnemonicStep1} />
                  <br />
                  <FormattedMessage {...langLabels.saveMnemonicStep2} values={{ domain: location.hostname }} />
                </p>
              </div>

              <div styleName="mnemonicButtonsWrapper">
                <Copy text={mnemonic}>
                  <Button brand>
                    <FormattedMessage id="FeeControler49" defaultMessage="Copy" />
                  </Button>
                </Copy>
                <div styleName="continueBtnWrapper">
                  <Button brand onClick={this.handleGoToConfirm}>
                    <FormattedMessage id="createWalletButton1" defaultMessage="Continue" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    )
  }
}

export default injectIntl(SaveMnemonicModal)
