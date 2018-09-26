import React from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { fixBodyOverflow, createPortal } from 'helpers/domUtils'

import SaveKeys from 'components/SaveKeys/SaveKeys'
import PrivateKeysModal from 'components/modals/PrivateKeysModal/PrivateKeysModal'
import Overlay from 'components/layout/Overlay/Overlay'
import Center from 'components/layout/Center/Center'
import Confirm from 'components/Confirm/Confirm'
import { constants } from 'helpers'
import styles from './SaveKeysModal.scss'


const views = {
  saveKeys: 'saveKeys',
  confirm: 'confirm',
  approve: 'approve',
}

export default class SaveKeysModal extends React.Component {

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

    render() {
      const { view } = this.state

      return (
        <Overlay>
          <Center keepFontSize>
            <React.Fragment>
              { process.env.TESTNET && (
                <a
                  href="#"
                  onClick={() => {
                    localStorage.setItem(constants.localStorage.testnetSkipPKCheck, true)
                    this.forceUpdate()
                  }}>
              Testnet: Don`t ask again
                </a>
              )}
              {
                view === views.saveKeys &&
                <SaveKeys
                  isDownload={this.handleDownload}
                  isChange={() => this.changeView(views.confirm)}
                />
              }
              {
                view === views.confirm &&
                  createPortal(
                    <Confirm
                      rootClassName={styles.areYouSure}
                      title="Are you sure ?"
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
            </React.Fragment>
          </Center>
        </Overlay>
      )
    }
}
