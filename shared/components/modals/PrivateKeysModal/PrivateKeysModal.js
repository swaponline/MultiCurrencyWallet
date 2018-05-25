import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'
import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './PrivateKeysModal.scss'

import Field from './Field/Field'
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

    actions.modals.close(name)
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
                <a styleName="link" href="./time.txt" target="_blank">Download instruction</a>
                <Field
                  label={ethData.currency}
                  privateKey={ethData.privateKey}
                />
                <Field
                  label={btcData.currency}
                  privateKey={btcData.privateKey}
                />
                <div styleName="link black" onClick={() => this.changeView('checkKeys')}>I did it! Continue</div>
              </Fragment>
            ) : (
              <Fragment>
                <div styleName="title">
                  Please fill information below. We`d like to be sure that you saved the private keys
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
                  isValidated ? (
                    <Button white styleName="button" onClick={this.close}>GO TO THE SITE!</Button>
                  ) : (
                    <div styleName="link black" onClick={() => this.changeView('saveKeys')}>...Go back</div>
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
