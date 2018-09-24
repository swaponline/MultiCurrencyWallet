import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import moment from 'moment-with-locales-es6'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { localStorage, constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './PrivateKeysModal.scss'

import Field2 from './Field2/Field2'
import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'


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
    view: 'saveKeys', // saveKeys, checkKeys
    ethValidated: false,
    btcValidated: false,
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

  getText = () => {
    const { ethData, btcData } = this.props


    const text = `
${window.location.hostname} emergency instruction
\r\n
\r\n
#ETHEREUM
\r\n
\r\n
Ethereum address: ${ethData.address}  \r\n
Private key: ${ethData.privateKey}\r\n
\r\n
\r\n
How to access tokens and ethers: \r\n
1. Go here https://www.myetherwallet.com/#send-transaction \r\n
2. Select 'Private key'\r\n
3. paste private key to input and click "unlock"\r\n
\r\n
\r\n
\r\n
# BITCOIN\r\n
\r\n
\r\n
Bitcoin address: ${btcData.address}\r\n
Private key: ${btcData.privateKey}\r\n
\r\n
\r\n
1. Go to blockchain.info\r\n
2. login\r\n
3. Go to settings > addresses > import\r\n
4. paste private key and click "Ok"\r\n
\r\n
\r\n
* We don\`t store your private keys and will not be able to restore them!
    `

    return text
  }

  handleDownload = () => {
    this.downloadInstructionsAnchor.click()
    const message = 'Check your browser downloads'

    this.changeView('checkKeys')

    actions.notifications.show(constants.notifications.Message, {
      message,
    })
  }

  handleSendByEmail = () => {
    const text = this.getText()

    window.open(`mailto:?subject=Your_Subject&body=${text}`)
  }

  render() {
    const { view } = this.state
    const { name, ethData, btcData } = this.props

    const ethValidated = Link.state(this, 'ethValidated')
    const btcValidated = Link.state(this, 'btcValidated')
    const isValidated = ethValidated.value && btcValidated.value

    return (
      <Modal
        styleName="modal"
        name={name}
        showCloseButton={false}
        whiteLogo
        title="CAUTION!"
      >
        <a
          href={`data:text/plaincharset=utf-8,${encodeURIComponent(this.getText())}`}
          download={`${window.location.hostname}_keys_${moment().format('DD.MM.YYYY')}.txt`}
          ref={ref => { this.downloadInstructionsAnchor = ref }}
          style={{ display: 'none' }}
        >
          Download Instructions
        </a>
        <div styleName="content">
          {
            view === 'saveKeys' ? (
              <Fragment>
                <div styleName="title">
                  Before you continue be sure to save your private keys!<br />
                  It`s very important because If you don`t<br />
                  there is a big chance you`ll loose your money.
                </div>
                <div styleName="subTitle">We don`t store your private keys and will not be able to restore them!</div>
                <Button brand styleName="button" onClick={this.handleDownload}>Download instruction</Button>
                {/* <Button brand styleName="button" onClick={this.handleSendByEmail}>Send by email</Button> */}
              </Fragment>
            ) : (
              <Fragment>
                <div styleName="title">
                  Please fill information below from instruction.txt file. We`d like to be sure that you saved the private keys
                  before you can continue to the site.
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
                {
                  isValidated && (
                    <Button white styleName="button" onClick={this.close}>GO TO THE SITE!</Button>
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
