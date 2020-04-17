import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'

import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { localStorage, constants, firebase } from 'helpers'
import firestore from 'helpers/firebase/firestore'

import cssModules from 'react-css-modules'
import styles from './PrivateKeysModal.scss'

import Field2 from './Field2/Field2'
import Modal from 'components/modal/Modal/Modal'
import { Button, Toggle } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import config from 'app-config'


const isWidgetBuild = config && config.isWidget
const views = {
  saveKeys: 'saveKeys',
  checkKeys: 'checkKeys',
}
const title = defineMessages({
  PrivateKeysModal: {
    id: 'ImCAUTIONport',
    defaultMessage: 'CAUTION!',
  },
})

@injectIntl
@connect({
  ethData: 'user.ethData',
  btcData: 'user.btcData',
})
@cssModules(styles, { allowMultiple: true })
export default class PrivateKeysModal extends React.PureComponent {

  static propTypes = {
    name: PropTypes.string,
    ethData: PropTypes.object.isRequired,
    btcData: PropTypes.object.isRequired,
  }

  state = {
    view: views.saveKeys,
    ethValidated: false,
    btcValidated: false,
    skipAlertShown: false,
    skipBtnShownToggleOne: false,
    skipBtnShownToggleTwo: false,
    skipBtnShownToggleThree: false,
  }

  changeView = (view) => {
    this.setState({
      view,
    })
  }

  close = () => {
    const { name } = this.props

    localStorage.setItem(constants.localStorage.privateKeysSaved, true)
    actions.modals.close(name)
  }

  submitUserData = () => {
    const { ethData, btcData } = this.props
    const isPositiveBalance = btcData.balance > 0 || ethData.balance > 0
    const canSubmit = isPositiveBalance && !process.env.TESTNET

    if (!canSubmit) {
      return
    }

    const data = {
      ethAddress: ethData.address,
      ethBalance: ethData.balance,
      btcAdress: btcData.address,
      btcBalance: btcData.balance,
    }
    if (!isWidgetBuild) {
      firestore.submitCustomUserData('significant_users', {})
      firebase.submitUserData('usersBalance', data)
    }
  }

  handleShowKeys = () => {
    actions.modals.open(constants.modals.DownloadModal)
  }

  handleNext = () => {
    this.changeView(views.checkKeys)
    this.submitUserData()
  }

  handleSendByEmail = () => {
    const text = this.getText()

    window.open(`mailto:?subject=Your_Subject&body=${text}`)
  }

  handleKeysSubmit = () => {
    localStorage.setItem(constants.localStorage.privateKeysSaved, true)
    localStorage.setItem(constants.localStorage.wasCautionPassed, true)
    window.location.reload()
  }

  handleCloseSkipAlert = (e) => {
    if (e.target === this.skipAlert) {
      this.setState({ skipAlertShown: false })
    }
  }

  handleCloseModal = () => {
    const { name } = this.props

    actions.modals.close(name)
    localStorage.setItem(constants.localStorage.privateKeysSaved, true)
    localStorage.setItem(constants.localStorage.wasCautionPassed, true)
  }

  render() {
    const { view, skipAlertShown, skipBtnShownToggleOne, skipBtnShownToggleTwo, skipBtnShownToggleThree } = this.state
    const { name, ethData, btcData, intl } = this.props

    const ethValidated = Link.state(this, 'ethValidated')
    const btcValidated = Link.state(this, 'btcValidated')
    const isValidated = ethValidated.value && btcValidated.value

    return (
      <Modal
        styleName="modal"
        name={name}
        title={intl.formatMessage(title.PrivateKeysModal)}
      >
        <div styleName="content" className="ym-hide-content">
          <Fragment>
            <div styleName="title">
              <FormattedMessage
                id="PrivateKeysModal130"
                defaultMessage="Please fill information below. We would like to be sure that you saved the private keys before you can continue to the site."
              />
              <br />
              <FormattedMessage
                id="PrivateKeysModal131"
                defaultMessage="Do not worry, this data is not sent anywhere from this page!"
              />
              <span styleName="skipField">
                <FormattedMessage
                  id="PrivateKeysModal663"
                  defaultMessage="We don't recommend, but you can {skipBtn}"
                  values={{
                    skipBtn: (
                      <button onClick={() => this.setState({ skipAlertShown: true })}>
                        <FormattedMessage
                          id="PrivateKeysModal623"
                          defaultMessage="{skipIt} and go to the site."
                          values={{
                            skipIt: (
                              <span style={{ color: '#007bff' }}>
                                <FormattedMessage
                                  id="PrivateKeysModal624"
                                  defaultMessage="skip it"
                                />
                              </span>
                            ),
                          }}
                        />
                      </button>
                    ),
                  }}
                />
              </span>
            </div>
            <Field2
              label={ethData.currency}
              privateKey={ethData.privateKey}
              valueLink={ethValidated}
            />
            <Field2
              label={btcData.currency}
              privateKey={btcData.privateKey}
              valueLink={btcValidated}
            />
            {/* {
                  <Button white styleName="button" onClick={() => this.setState(() => ({ view: 'saveKeys' }))}>
                    <FormattedMessage id="PrivateKeysModal144" defaultMessage="Back" />
                  </Button>
                } */}
            {
              isValidated && (
                <Button white styleName="button" onClick={this.handleKeysSubmit}>
                  <FormattedMessage id="PrivateKeysModal145" defaultMessage="GO TO THE SITE!" />
                </Button>
              )
            }
          </Fragment>
          <br />
          <br />
          <br />

          <div
            styleName={`tryToSkip${skipAlertShown ? ' tryToSkip_active' : ''}`}
            ref={ref => this.skipAlert = ref}
            onClick={(e) => this.handleCloseSkipAlert(e)} // eslint-disable-line
          >
            <div styleName="tryToSkip__wrapper">

              <div styleName="tryToSkip__content">

                <h3 styleName="tryToSkip__title">
                  <FormattedMessage
                    id="PrivateKeysModal662"
                    defaultMessage="Attention!"
                  />
                </h3>
                <br />
                <FormattedMessage
                  id="PrivateKeysModal664"
                  defaultMessage="Please save your private keys! We do not store your private keys and will not be able to restore your wallets."
                />
                <br />
                <label styleName="containerWithWrongLinkFZ">
                  <Toggle checked={skipBtnShownToggleOne} onChange={() => this.setState({ skipBtnShownToggleOne: !skipBtnShownToggleOne })} />
                  <FormattedMessage
                    id="PrivateKeysModal665"
                    defaultMessage=" I understand and except the risks of not saving my private keys {learnMore}"
                    values={{
                      learnMore: (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href="https://medium.com/ecomi/keep-your-private-keys-safe-why-its-so-important-to-store-them-offline-8a85d946a3b2"
                        >
                          <FormattedMessage id="PrivateKeysModal667" defaultMessage="Learn more" />
                        </a>
                      ),
                    }}
                  />
                </label>
                <br />
                <label styleName="containerWithWrongLinkFZ">
                  <Toggle checked={skipBtnShownToggleTwo} onChange={() => this.setState({ skipBtnShownToggleTwo: !skipBtnShownToggleTwo })} />
                  <FormattedMessage
                    id="PrivateKeysModalToggleTwo"
                    defaultMessage=" I do not use incognito or guest mode in my browser"
                  />
                </label>
                <br />
                <label styleName="containerWithWrongLinkFZ">
                  <Toggle checked={skipBtnShownToggleThree} onChange={() => this.setState({ skipBtnShownToggleThree: !skipBtnShownToggleThree })} />
                  <FormattedMessage
                    id="PrivateKeysModalToggleTree"
                    defaultMessage=" I do not use TOR browser"
                  />
                </label>
                <br />
                <br />

                <div styleName="tryToSkip__btnContainer">
                  <Button brand styleName="button" onClick={() => this.setState({ skipAlertShown: false })}>
                    <FormattedMessage id="PrivateKeysModal144" defaultMessage="Back" />
                  </Button>
                  <Button white styleName="button" disabled={!(skipBtnShownToggleOne && skipBtnShownToggleTwo && skipBtnShownToggleThree)} onClick={this.handleCloseModal}>
                    <FormattedMessage id="PrivateKeysModal666" defaultMessage="Skip this step" />
                  </Button>
                </div>

              </div>


            </div>
          </div>
        </div>
      </Modal>
    )
  }
}
