import React from 'react'
import PropTypes from 'prop-types'
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
    defaultMessage: `Экспорт приватных ключей`,
  }
})

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class SaveKeysModal extends React.Component<any, any> {

  props: any

  static propTypes = {
    view: PropTypes.string,
  }

  static defaultProps = {
    view: views.saveKeys,
  }

  state = {
    view: this.props.view,
  }

  componentWillMount = () => {
    fixBodyOverflow(true)
  }

  componentWillUnmount = () => {
    fixBodyOverflow(false)
  }

  changeView = (view) => this.setState({ view })

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
      <Modal name="SaveKeysModal" title={`${intl.formatMessage(langLabels.title)}`} onClose={this.handleClose} showCloseButton>
        {
          process.env.TESTNET && (
            <div styleName="testnetSkip">
              <a
                href="#"
                onClick={() => {
                  //@ts-ignore
                  localStorage.setItem(constants.localStorage.testnetSkipPKCheck, true)
                  this.forceUpdate()
                }}>
                <FormattedMessage id="SaveKeysModal" defaultMessage="Testnet: Don`t ask again" />
              </a>
            </div>
          )
        }
        {
          view === views.saveKeys &&
          <SaveKeys
            isDownload={this.handleDownload}
            isChange={() => {
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
