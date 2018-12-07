import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'

import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { localStorage, constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './PrivateKeysModal.scss'

import Field2 from './Field2/Field2'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import { FormattedMessage } from 'react-intl'


const views = {
  saveKeys: 'saveKeys',
  checkKeys: 'checkKeys',
}

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
    isDownload: false,
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

  handleDownload = () => {
    actions.user.downloadPrivateKeys()
    actions.notifications.show(constants.notifications.Message, {
      message: 'Check your browser downloads',
    }
  )

    this.setState(() => ({ isDownload: true }))
  }

  handleNext = () => {
    this.changeView(views.checkKeys)
  }

  handleSendByEmail = () => {
    const text = this.getText()

    window.open(`mailto:?subject=Your_Subject&body=${text}`)
  }

  handleKeysSubmit = () => {
    localStorage.setItem(constants.localStorage.privateKeysSaved, true)
    window.location.reload()
  }

  render() {
    const { view, isDownload } = this.state
    const { name, ethData, btcData } = this.props

    const ethValidated = Link.state(this, 'ethValidated')
    const btcValidated = Link.state(this, 'btcValidated')
    const isValidated = ethValidated.value && btcValidated.value

    return (
      <Modal
        styleName="modal"
        name={name}
        showCloseButton={false}
        showLogo={false}
        title="CAUTION!"
      >
        <div styleName="content">
          {
            view === views.saveKeys ? (
              <Fragment>
                <div styleName="title">
                  <FormattedMessage
                    id="PrivateKeysModal991"
                    defaultMessage="Before you continue be sure to save your private keys!"
                  />
                  <FormattedMessage id="PrivateKeysModal99" defaultMessage="It`s very important" />
                </div>
                <FormattedMessage id="PrivateKeysModal105" defaultMessage="We do not store your private keys and will not be able to restore them!">
                  {message => <div styleName="subTitle">{message}</div>}
                </FormattedMessage>
                <div styleName="buttonContainer">
                  <div styleName="buttonSubContainer">
                    <FormattedMessage id="PrivateKeysModal110" defaultMessage="Click here">
                      {message => <span styleName="text">{message}</span>}
                    </FormattedMessage>
                    <Button brand styleName="button" onClick={this.handleDownload}>
                      <FormattedMessage id="PrivateKeysModal113" defaultMessage="Download keys" />
                    </Button>
                  </div>
                  <div styleName="buttonSubContainer">
                    <FormattedMessage id="PrivateKeysModal118" defaultMessage="Then click here">
                      {message => <span styleName="text">{message}</span>}
                    </FormattedMessage>
                    <Button brand styleName="button" onClick={this.handleNext} >
                      <FormattedMessage id="PrivateKeysModal121" defaultMessage="Next step" />
                    </Button>
                  </div>
                </div>
                {/* <Button brand styleName="button" onClick={this.handleSendByEmail}>Send by email</Button> */}
              </Fragment>
            ) : (
              <Fragment>
                <FormattedMessage
                  id="PrivateKeysModal130"
                  defaultMessage=
                    "Please fill information below from instruction.txt file. We`d like to be sure that you saved the private keys before you can continue to the site."
                >
                  {message => <div styleName="title">{message}</div>}
                </FormattedMessage>
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
                {
                  <Button white styleName="button" onClick={() => this.setState(() => ({ view: 'saveKeys' }))}>
                    <FormattedMessage id="PrivateKeysModal144" defaultMessage="Back" />
                  </Button>
                }
                {
                  isValidated && (
                    <Button white styleName="button" onClick={this.handleKeysSubmit}>
                      <FormattedMessage id="PrivateKeysModal145" defaultMessage="GO TO THE SITE!" />
                    </Button>
                  )
                }
              </Fragment>
            )
          }
        </div>
      </Modal>
    )
  }
}
