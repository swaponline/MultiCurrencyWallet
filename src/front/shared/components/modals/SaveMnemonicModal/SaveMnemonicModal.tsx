import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './SaveMnemonicModal.scss'
import okSvg from 'shared/images/ok.svg'

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
import feedback from 'shared/helpers/feedback'


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
  mnemonicCopied: {
    id: `${langPrefix}_MnemonicCopied`,
    defaultMessage: `Скопировано...`,
  },
  copyMnemonic: {
    id: `${langPrefix}_CopyMnemonic`,
    defaultMessage: `Скопировать`,
  },
  shareMnemonic: {
    id: `${langPrefix}_ShareMnemonic`,
    defaultMessage: `Share`,
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
    values: { href: <Link to={links.savePrivateKeys}> <FormattedMessage id="MnemoniceDeleted_hrefText" defaultMessage="Try export private key" /></Link> }
  },
  Continue: {
    id: `${langPrefix}_Continue`,
    defaultMessage: `Продолжить`,
  },
  Ready: {
    id: `${langPrefix}_Ready`,
    defaultMessage: `Готово`,
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

@injectIntl
@connect(
  ({
    user: { btcMultisigUserData },
  }) => ({
    btcData: btcMultisigUserData,
  })
)
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
export default class SaveMnemonicModal extends React.Component<any, any> {

  props: any

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

    const randomedWords = (mnemonic !== '-') ? mnemonic.split(` `) : []
    randomedWords.sort(() => .5 - Math.random())

    const words = (mnemonic !== '-') ? mnemonic.split(` `) : []

    this.state = {
      step: (mnemonic === '-') ? `removed` : `begin`,
      mnemonic,
      words,
      enteredWords: [],
      randomedWords,
      mnemonicInvalid: true,
      incorrectWord: false,
      isMnemonicCopied: false,
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

    if (data && typeof data.onClose === 'function') {
      data.onClose()
    } else {
      window.location.assign(links.hashHome)
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
      randomedWords,
      enteredWords,
      words,
      mnemonic,
    } = this.state

    let clickedWord

    const currentWord = enteredWords.length

    if (words[currentWord] !== randomedWords[index]) {

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

    clickedWord = randomedWords.splice(index, 1)
    enteredWords.push(clickedWord)


    this.setState({
      randomedWords,
      enteredWords,
      incorrectWord: false,
      mnemonicInvalid: (enteredWords.join(` `) !== mnemonic),
    }, () => {
      if (randomedWords.length === 0) {
        localStorage.setItem(constants.privateKeyNames.twentywords, '-')
        actions.backupManager.serverCleanupSeed()

        this.setState({
          step: `ready`,
        })
      }
    })
  }

  handleCopyMnemonic = () => {
    this.setState({
      isMnemonicCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isMnemonicCopied: false,
        })
      }, 500)
    })
  }

  handleShareMnemonic = () => {
    const {
      intl,
    } = this.props

    const { mnemonic } = this.state

    actions.modals.open(constants.modals.Share, {
      title: intl.formatMessage(langLabels.shareMnemonicTitle),
      link: mnemonic,
    })
  }


  render() {
    const {
      name,
      intl
    } = this.props

    const {
      step,
      words,
      enteredWords,
      mnemonic,
      randomedWords,
      mnemonicInvalid,
      incorrectWord,
      isMnemonicCopied,
    } = this.state

    // const linked = Link.all(this, 'address', 'amount', 'from')

    return (
      <Modal name={name} title={`${intl.formatMessage(langLabels.title)}`} onClose={this.handleClose} showCloseButton={true}>
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
            <Fragment>
              <p styleName="notice mnemonicNotice">
                <FormattedMessage {...langLabels.beginNotice} values={{
                  br: <br />,
                }}/>
              </p>
              <div styleName="buttonsHolder">
                <Button blue onClick={() => {
                  feedback.backup.started()
                  this.setState({ step: `show` })
                }}>
                  <FormattedMessage {...langLabels.beginContinue} />
                </Button>
                <Button blue onClick={this.handleClose}>
                  <FormattedMessage {...langLabels.beginLater} />
                </Button>
              </div>
            </Fragment>
          )}
          {step === `ready` && (
            <Fragment>
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
                  <FormattedMessage {...langLabels.Ready} />
                </Button>
              </div>
            </Fragment>
          )}
          {step === `confirmMnemonic` && (
            <Fragment>
              <div styleName="highLevel">
                <div styleName={`mnemonicView mnemonicEnter ${(incorrectWord) ? 'mnemonicError' : ''}`}>
                  {
                    enteredWords.map((word, index) => {
                      return (
                        <button key={index} onClick={() => { }} className="ym-hide-content notranslate" translate="no">
                          {word}
                        </button>
                      )
                    })
                  }
                </div>
                <div styleName="mnemonicWords">
                  {
                    randomedWords.map((word, index) => {
                      return (
                        <button key={index} onClick={() => this.handleClickWord(index)} className="ym-hide-content notranslate" translate="no">
                          {word}
                        </button>
                      )
                    })
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
                  <FormattedMessage {...langLabels.Ready} />
                </Button>
              </div>
            </Fragment>
          )}
          {step === `show` && (
            <Fragment>
              <div styleName="highLevel">
                <div styleName="mnemonicView" className="ym-hide-content notranslate" translate="no">
                  {
                    words.map((word, index) => {
                      return (
                        <>
                          <div key={index}>
                            <span styleName="wordIndex">{(index + 1)}</span>
                            <span>{word}</span>
                          </div>
                          {
                            /* space for correct copy-paste */
                            index + 1 !== words.length && ' '
                          }
                        </>
                      )
                    })
                  }
                </div>
                <p styleName="notice saveMnemonicToPaper mnemonicNotice">
                  <FormattedMessage {...langLabels.saveMnemonicStep1} />
                  <FormattedMessage {...langLabels.saveMnemonicStep2} values={{ domain: location.hostname }} />
                </p>
                {/*
                <div styleName="buttonsHolder">
                  <CopyToClipboard
                    text={mnemonic}
                    onCopy={this.handleCopyMnemonic}
                  >
                    <Button blue disabled={isMnemonicCopied} onClick={this.handleCopyMnemonic}>
                      {isMnemonicCopied ? (
                        <FormattedMessage { ...langLabels.mnemonicCopied } />
                      ) : (
                        <FormattedMessage { ...langLabels.copyMnemonic } />
                      )}
                    </Button>
                  </CopyToClipboard>
                  <Button blue onClick={this.handleShareMnemonic}>
                    <FormattedMessage { ...langLabels.shareMnemonic } />
                  </Button>
                </div>
              */}
              </div>
              <div styleName="lowLevel">
                <Button
                  styleName="buttonCenter buttonHalfFullWidth"
                  blue
                  onClick={this.handleGoToConfirm}
                  fullWidth
                >
                  <FormattedMessage {...langLabels.Continue} />
                </Button>
              </div>
            </Fragment>
          )}
        </div>
      </Modal>
    )
  }
}
