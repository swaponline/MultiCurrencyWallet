import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'

import TextLabel from './TextLabel/TextLabel'
import Modal from 'components/modal/Modal/Modal'


@connect({
  ethData: 'user.ethData',
  btcData: 'user.btcData',
})
export default class KeyModal extends React.PureComponent {

  static propTypes = {
    name: PropTypes.string,
  }

  render() {
    const { name, ethData, btcData } = this.props
    return (
      <Modal name={name} showCloseButton={false} title="Save private key">
        <a
          href="./time.txt"
          download
          onClick={() => actions.modals.close(name)}
        >
        Download instruction
        </a>
        <TextLabel
          name={ethData.currency}
          privateKey={ethData.privateKey}
          isSave={this.isSave}
        />

        <TextLabel
          name={btcData.currency}
          privateKey={btcData.privateKey}
          isSave={this.isSave}
        />
        <p>You will continue after save</p>
      </Modal>
    )
  }
}
