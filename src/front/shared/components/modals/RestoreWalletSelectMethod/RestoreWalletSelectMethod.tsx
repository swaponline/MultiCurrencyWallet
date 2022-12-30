import React from 'react'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './RestoreWalletSelectMethod.scss'
import Modal from 'components/modal/Modal/Modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import links from 'helpers/links'
import { constants } from 'helpers'


const langPrefix = `RestoreWalletSelectMethod`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: 'Восстановление кошелька',
  },
  useShamirs: {
    id: `${langPrefix}_UseShamirs`,
    defaultMessage: `Восстановить используя Shamir's Secret-Share`,
  },
  useMnemonic: {
    id: `${langPrefix}_UseMnemonic`,
    defaultMessage: 'Восстановить используя 12-слов',
  },
  cancel: {
    id: `${langPrefix}_Cancel`,
    defaultMessage: 'Отмена',
  },
  selectMethod: {
    id: `${langPrefix}_SelectMethod`,
    defaultMessage: 'Выберите способо восстановления',
  },
})


@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class RestoreWalletSelectMethod extends React.PureComponent<any, any> {
  constructor(props) {
    super(props)
  }

  handleCloseModal = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (data && typeof data.onClose === 'function') {
      data.onClose()
    } else if (!(data && data.noRedirect)) {
      window.location.assign(links.hashHome)
    }

    actions.modals.close(name)
  }

  handleUseShamirs = () => {
    const { data, onClose } = this.props
    actions.modals.open(constants.modals.ShamirsSecretRestory, data)
  }

  handleUseMnemonic = () => {
    const { data, onClose } = this.props
    actions.modals.open(constants.modals.RestoryMnemonicWallet, data)
  }

  render() {
    const {
      name,
      intl,
    } = this.props

    return (
      <Modal
        name={name}
        showCloseButton
        onClose={this.handleCloseModal}
        title={intl.formatMessage(langLabels.title)}
      >
        <section styleName="content">
          <div styleName="highLevel">
            <div styleName="buttonHolder">
              <Button id='restoreWalletUseMnemonic' blue onClick={this.handleUseMnemonic}>
                <FormattedMessage {...langLabels.useMnemonic} />
              </Button>
              <Button id='restoreWalletUseShamirs' blue onClick={this.handleUseShamirs}>
                <FormattedMessage {...langLabels.useShamirs} />
              </Button>
              <Button gray onClick={this.handleCloseModal}>
                <FormattedMessage {...langLabels.cancel} />
              </Button>
            </div>
          </div>
        </section>
      </Modal>
    )
  }
}

export default injectIntl(RestoreWalletSelectMethod)
