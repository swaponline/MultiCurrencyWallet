import React from 'react'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from './PrivateKeysModal.scss'
import Copy from 'components/ui/Copy/Copy'
import Modal from 'components/modal/Modal/Modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

const title = defineMessages({
  PrivateKeysModal: {
    id: 'ImCAUTIONport',
    defaultMessage: 'CAUTION!',
  },
})

@cssModules(styles, { allowMultiple: true })
class PrivateKeysModal extends React.PureComponent<any, any> {
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
        showCloseButton
        onClose={this.handleCloseModal}
        title={intl.formatMessage(title.PrivateKeysModal)}
      >
        <section styleName="content">
          <p styleName="text">
            <FormattedMessage
              id="privateKeyCurrency"
              defaultMessage="Your {cur} private key"
              values={{
                cur: fullName,
              }}
            />
          </p>
          <p styleName="key" className="ym-hide-content">
            {key}
          </p>
          <Copy text={key}>
            <Button brand>
              <FormattedMessage id="FeeControler49" defaultMessage="Copy" />
            </Button>
          </Copy>
        </section>
      </Modal>
    )
  }
}

export default injectIntl(PrivateKeysModal)
