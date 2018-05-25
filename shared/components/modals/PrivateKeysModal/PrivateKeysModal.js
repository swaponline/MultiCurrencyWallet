import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './PrivateKeysModal.scss'

import Field from './Field/Field'
import Modal from 'components/modal/Modal/Modal'


@connect({
  ethData: 'user.ethData',
  btcData: 'user.btcData',
})
@cssModules(styles)
export default class PrivateKeysModal extends React.PureComponent {

  static propTypes = {
    name: PropTypes.string,
    ethData: PropTypes.object.isRequired,
    btcData: PropTypes.object.isRequired,
  }

  render() {
    const { name, ethData, btcData } = this.props

    return (
      <Modal
        styleName="modal"
        name={name}
        showCloseButton={false}
        title="CAUTION!"
      >
        <a
          href="./time.txt"
          download
          onClick={() => actions.modals.close(name)}
        >
        Download instruction
        </a>
        <Field
          label={ethData.currency}
          privateKey={ethData.privateKey}
        />
        <Field
          label={btcData.currency}
          privateKey={btcData.privateKey}
        />
        <p>You will continue after save</p>
      </Modal>
    )
  }
}
