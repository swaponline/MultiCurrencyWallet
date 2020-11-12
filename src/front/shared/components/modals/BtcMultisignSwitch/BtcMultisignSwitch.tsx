import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './BtcMultisignSwitch.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'

import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'

import Table from 'components/tables/Table/Table'
import WalletRow from './WalletRow'


@injectIntl
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
export default class BtcMultisignSwitch extends React.Component<any, any> {

  props: any

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor() {
    //@ts-ignore
    super()


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
