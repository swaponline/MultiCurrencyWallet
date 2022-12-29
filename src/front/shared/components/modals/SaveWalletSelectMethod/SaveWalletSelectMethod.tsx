import React from 'react'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'
import styles from '../Styles/default.scss'
import ownStyle from './SaveWalletSelectMethod.scss'
import Modal from 'components/modal/Modal/Modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import links from 'helpers/links'
import { constants } from 'helpers'


const langPrefix = `SaveWalletSelectMethod`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: 'Сохранение кошелька',
  },
  useShamirs: {
    id: `${langPrefix}_UseShamirs`,
    defaultMessage: `Сохранить Shamir's Secret-Share`,
  },
  useMnemonic: {
    id: `${langPrefix}_UseMnemonic`,
    defaultMessage: 'Сохранить 12-слов',
  },
  cancel: {
    id: `${langPrefix}_Cancel`,
    defaultMessage: 'Отмена',
  },
  selectMethod: {
    id: `${langPrefix}_SelectMethod`,
    defaultMessage: 'Выберите способ',
  },
})


@cssModules({ ...styles, ...ownStyle }, { allowMultiple: true })
class SaveWalletSelectMethod extends React.PureComponent<any, any> {
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

    actions.modals.open(constants.modals.ShamirsSecretSave, data)
  }

  handleUseMnemonic = () => {
    const { data, onClose } = this.props
    actions.modals.open(constants.modals.SaveMnemonicModal, data)
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
              <Button blue onClick={this.handleUseMnemonic}>
                <FormattedMessage {...langLabels.useMnemonic} />
              </Button>
              <Button blue onClick={this.handleUseShamirs}>
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

export default injectIntl(SaveWalletSelectMethod)
