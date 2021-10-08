import React from 'react'

import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './WalletAddressModal.scss'

import Modal from 'components/modal/Modal/Modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const langPrefix = `WalletAddressModal`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Copy wallet address`,
  },
  message: {
    id: `${langPrefix}_Message`,
    defaultMessage: `Your {cur} address`,
  },
})

@cssModules(styles, { allowMultiple: true })
class WalletAddressModal extends React.PureComponent<any, any> {
  handleCloseModal = () => {
    const { name } = this.props

    actions.modals.close(name)
  }

  render() {
    const { name, intl, data } = this.props
    const { fullName, address } = data

    return (
      <Modal
        name={name}
        onClose={this.handleCloseModal}
        title={intl.formatMessage(langLabels.title)}
      >
        <section styleName="content">
          <p styleName="text">
            <FormattedMessage {...langLabels.message} 
              values={{
                cur: fullName,
              }}
            />
          </p>
          <p styleName="address">
            {address}
          </p>
        </section>

      </Modal>
    )
  }
}

export default injectIntl(WalletAddressModal)
