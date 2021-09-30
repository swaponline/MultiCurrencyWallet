import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './BtcMultisignSwitch.scss'

import Modal from 'components/modal/Modal/Modal'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import Table from 'components/tables/Table/Table'
import WalletRow from './WalletRow'


@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
class BtcMultisignSwitch extends React.Component<any, any> {
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      wallets: [],
      isFetching: true,
    }
  }

  handleRefresh = async () => {
    this.refreshWallets()
  }

  componentDidMount() {
    this.refreshWallets()
  }

  refreshWallets() {
    //@ts-ignore
    actions.btcmultisig.getBtcMultisigKeys().then((wallets) => {
      this.setState({
        wallets,
        isFetching: false,
      })
    })
  }

  handleFinish = async () => {
    const { name } = this.props
    actions.modals.close(name)

    if (this.props.data.callback) {
      this.props.data.callback()
    }
  }

  render() {
    const { name, intl } = this.props
    const { wallets, isFetching } = this.state
    const itemsCount = wallets.length

    const langLabels = defineMessages({
      title: {
        id: 'btcmsSwitchTitle',
        defaultMessage: `Подключенные BTC-Multisign кошельки`,
      },
      fetching: {
        id: 'btcmsSwitchFetchWalletsData',
        defaultMessage: `Загрузка BTC-Multisign кошельков`,
      },
      empty: {
        id: 'btcmsSwitchFetchWalletsEmpty',
        defaultMessage: `У вас нет BTC-Multisign кошельков`,
      }
    })

    return (
      <Modal name={name} title={`${intl.formatMessage(langLabels.title)}`}>
        <Fragment>
          <Table
            styleName="wallets"
            rows={wallets}
            textIfEmpty={`${intl.formatMessage((isFetching) ? langLabels.fetching : langLabels.empty)}`}
            rowRender={(row, index, selectId, handleSelectId) => (
              <WalletRow
                key={index}
                index={index}
                itemsCount={itemsCount}
                item={row}
                handleFinish={this.handleFinish}
                handleRefresh={this.handleRefresh}
              />
            )}
            { ... this.props }
          />
        </Fragment>
      </Modal>
    )
  }
}

export default injectIntl(BtcMultisignSwitch)
