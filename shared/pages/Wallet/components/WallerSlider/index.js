import React, { Component, Fragment } from 'react'

import { constants } from 'helpers'
import actions from 'redux/actions'

import security from '../NotityBlock/images/security.svg'
import mail from '../NotityBlock/images/mail.svg'
import info from '../NotityBlock/images/info-solid.svg'

import NotifyBlock from 'pages/Wallet/components/NotityBlock/NotifyBock'
import config from 'app-config'

import { FormattedMessage } from 'react-intl'


const isWidgetBuild = config && config.isWidget


export default class WallerSlider extends Component {

  constructor(props) {
    super(props)
    
    const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    const mnemonicDeleted = (mnemonic === '-')
    
    this.state = {
      mnemonicDeleted,
    }
  }

  handleShowKeys = () => {
    actions.modals.open(constants.modals.DownloadModal)
  }

  handleSaveKeys = () => {
    actions.modals.open(constants.modals.PrivateKeys)
  }

  handleShowMnemonic = () => {
    actions.modals.open(constants.modals.SaveMnemonicModal, {
      onClose: () => {
        const mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
        const mnemonicDeleted = (mnemonic === '-')
        if (mnemonicDeleted) {
          const { handleNotifyBlockClose } = this.props
          handleNotifyBlockClose()
        }
        this.setState({
          mnemonicDeleted,
        })
      }
    })
  }

  handleSignUp = () => {
    actions.modals.open(constants.modals.SignUp)
  }

  render() {
    const {
      settings,
      isPrivateKeysSaved,
      isClosedNotifyBlockSignUp,
      isSigned,
      isClosedNotifyBlockBanner,
      handleNotifyBlockClose,
      host
    } = this.props

    const {
      mnemonicDeleted 
    } = this.state

    let firstBtnTitle = <FormattedMessage id="descr282" defaultMessage="Show my keys" />
    if (!mnemonicDeleted) firstBtnTitle = <FormattedMessage id="ShowMyMnemonic" defaultMessage="Показать 12 слов" />

    return isWidgetBuild ? null : (
      <Fragment>
        {!isPrivateKeysSaved && (
          <NotifyBlock
            className="notifyBlockSaveKeys"
            descr={
              <FormattedMessage id="descr279" defaultMessage="Before you continue be sure to save your private keys!" />
            }
            tooltip={
              <FormattedMessage
                id="descr280"
                defaultMessage="We do not store your private keys and will not be able to restore them"
              />
            }
            icon={security}
            firstBtn={firstBtnTitle}
            firstFunc={(mnemonicDeleted) ? this.handleShowKeys : this.handleShowMnemonic}
            secondBtn={<FormattedMessage id="descr284" defaultMessage="I saved my keys" />}
            secondFunc={handleNotifyBlockClose}
          />
        )}
      </Fragment>
    )
  }
}