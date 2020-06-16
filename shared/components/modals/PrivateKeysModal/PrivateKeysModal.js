import React from 'react'

import actions from 'redux/actions'
import { localStorage, constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './PrivateKeysModal.scss'

import Modal from 'components/modal/Modal/Modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const title = defineMessages({
  PrivateKeysModal: {
    id: 'ImCAUTIONport',
    defaultMessage: 'CAUTION!',
  },
})

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class PrivateKeysModal extends React.PureComponent {

  handleSaveToClipBoard = () => {
    const { data } = this.props
    const { key } = data

    navigator.clipboard.writeText(key)
  }


  handleCloseModal = () => {
    const { name } = this.props

    actions.modals.close(name)
  }

  render() {
    const { name, intl, data } = this.props
    const { fullName, key } = data

    return (
      <Modal
        name={name}
        onClose={this.handleCloseModal}
        title={intl.formatMessage(title.PrivateKeysModal)}
      >
        <section styleName="content">
          <p styleName="text">
            <FormattedMessage
              id="privateKeyCurrency"
              defaultMessage="Your {cur} pivate key"
              values={{
                cur: fullName,
              }}
            />
          </p>
          <p styleName="key">
            {key}
          </p>
          <Button blue fullWidth onClick={this.handleSaveToClipBoard}>
            <FormattedMessage
              id="privateKeyAction"
              defaultMessage="Copy"
            />
          </Button>
        </section>

      </Modal>
    )
  }
}
