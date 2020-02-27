import React, { Fragment } from 'react'

import { constants } from 'helpers'
import actions from 'redux/actions'

import security from '../NotityBlock/images/security.svg'
import mail from '../NotityBlock/images/mail.svg'
import info from '../NotityBlock/images/info-solid.svg'

import NotifyBlock from 'pages/Wallet/components/NotityBlock/NotifyBock'
import config from 'app-config'

import { FormattedMessage } from 'react-intl'

const isWidgetBuild = config && config.isWidget
const handleShowKeys = () => {
  actions.modals.open(constants.modals.DownloadModal)
}

const handleSaveKeys = () => {
  actions.modals.open(constants.modals.PrivateKeys)
}

const handleSignUp = () => {
  actions.modals.open(constants.modals.SignUp)
}

export default props => {
  const {
    settings,
    isPrivateKeysSaved,
    isClosedNotifyBlockSignUp,
    isSigned,
    isClosedNotifyBlockBanner,
    handleNotifyBlockClose,
    host
  } = props
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
          firstBtn={<FormattedMessage id="descr282" defaultMessage="Show my keys" />}
          firstFunc={handleShowKeys}
          secondBtn={<FormattedMessage id="descr284" defaultMessage="I saved my keys" />}
          secondFunc={handleNotifyBlockClose}
        />
      )}
    </Fragment>
  )
}
