import React from 'react'
import cssModules from 'react-css-modules'

import actions from 'redux/actions'
import { fixBodyOverflow, createPortal } from 'helpers/domUtils'

import SaveKeys from 'components/SaveKeys/SaveKeys'
import PrivateKeysModal from 'components/modals/PrivateKeysModal/PrivateKeysModal'
import Modal from 'components/modal/Modal/Modal'
import links from 'helpers/links'

import Confirm from 'components/Confirm/Confirm'
import { constants } from 'helpers'
import styles from './SaveKeysModal.scss'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'


const views = {
  saveKeys: 'saveKeys',
  confirm: 'confirm',
  approve: 'approve',
}

const title = defineMessages({
  Areyousure: {
    id: 'Areyousure',
    defaultMessage: 'Are you sure ?',
  },
})

const langLabels = defineMessages({
  title: {
    id: `SaveKeysModal_Title`,
    defaultMessage: `Private keys export`,
  }
})

type SaveKeysModalProps = {
  intl: IUniversalObj
  view: string
}

type SaveKeysModalState = {
  view: string
}

@cssModules(styles, { allowMultiple: true })
class SaveKeysModal extends React.Component<SaveKeysModalProps, SaveKeysModalState> {
  constructor(props) {
    super(props)

    this.state = {
      view: props.view,
    }
  }

  static defaultProps = {
    view: views.saveKeys,
  }

  componentWillMount = () => {
    fixBodyOverflow(true)
  }

  componentWillUnmount = () => {
    fixBodyOverflow(false)
  }

  changeView = (view) => {
    this.setState(() => ({
      view,
    }))
  }

  handleConfirm = () => {
    this.changeView(views.approve)
  }

  handleDownload = () => {
    actions.user.downloadPrivateKeys()
  }

  handleClose = () => {
    window.location.assign(links.hashHome)
  }

  render() {
    const { view } = this.state
    const { intl } = this.props

    return (
      //@ts-ignore: strictNullChecks
      <Modal name="SaveKeysModal" title={`${intl.formatMessage(langLabels.title)}`} onClose={this.handleClose} showCloseButton>
        {
          process.env.TESTNET && (
            <div styleName="testnetSkip">
              <a
                href="#"
                onClick={() => {
                  localStorage.setItem(constants.localStorage.testnetSkipPKCheck, 'true')
                  this.forceUpdate()
                }}>
                <FormattedMessage id="SaveKeysModal" defaultMessage="Testnet: Don`t ask again" />
              </a>
            </div>
          )
        }
        {
          view === views.saveKeys &&
          //@ts-ignore: strictNullChecks
          <SaveKeys
            onDownload={this.handleDownload}
            onChange={() => {
              this.changeView(views.confirm)
              this.handleClose()
            }}
          />
        }
        {
          view === views.confirm &&
          createPortal(
            <Confirm
              rootClassName={styles.areYouSure}
              title={intl.formatMessage(title.Areyousure)}
              isConfirm={() => this.handleConfirm()}
              isReject={() => this.changeView(views.saveKeys)}
              animation={view === views.confirm}
            />
          )
        }
        {
          view === views.approve &&
          createPortal(<PrivateKeysModal />)
        }

      </Modal >
    )
  }
}

export default injectIntl(SaveKeysModal)
