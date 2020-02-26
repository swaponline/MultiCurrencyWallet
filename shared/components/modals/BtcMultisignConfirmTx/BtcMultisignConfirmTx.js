import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import helpers, { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { connect } from 'redaction'
import config from 'app-config'

import cssModules from 'react-css-modules'

import defaultStyles from '../Styles/default.scss'
import styles from './BtcMultisignConfirmTx.scss'

import { BigNumber } from 'bignumber.js'
import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { isMobile } from 'react-device-detect'

import links from 'helpers/links'


const langPrefix = `multiSignConfirmTxModal`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: `Подтверждение BTC Multisign транзакции`,
  },
  noticeUp: {
    id: `${langPrefix}_UpNotice`,
    defaultMessage: `Ознакомьтесь с транзакцией и подтвердите её. Если вы против списания, отмените тразакцию`,
  },
  noticeFetching: {
    id: `${langPrefix}_NoticeFetching`,
    defaultMessage: `Загрузка...`,
  },
  confirmTx: {
    id: `${langPrefix}_ConfirmTx`,
    defaultMessage: `Подтвердить`,
  },
  dismatchTx: {
    id: `${langPrefix}_DismatchTx`,
    defaultMessage: `Отклонить`,
  },
})

@injectIntl
@connect(
  ({
    user: { btcMultisigUserData },
  }) => ({
    btcData: btcMultisigUserData,
  })
)
@cssModules({ ...defaultStyles, ...styles }, { allowMultiple: true })
export default class BtcMultisignConfirmTx extends React.Component {
  
  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  constructor(props) {
    super(props)



    this.state = {
      step: `fetchgin`,
    }
  }

  componentDidMount() {
    setTimeout(async () => {
      const {
        data: {
          txData,
        }
      } = this.props

      this.setState({
        step: `txInfo`,
        txData: await actions.btcmultisig.parseRawTX(txData),
      })
    }, 5000)
  }

  handleFinish = async () => {

  }

  render() {
    const {
      name,
      intl,
    } = this.props

    const {
      step,
    } = this.state

    const { debugShowTXB, debugShowInput, debugShowOutput } = this.state

    return (
      <Modal name={name} title={`${intl.formatMessage(langLabels.title)}`}>
        <Fragment>
          <p styleName="notice">
            <FormattedMessage { ... langLabels.noticeUp } />
          </p>
          {step === `fetchgin` && (
            <p styleName="notice">
              <FormattedMessage { ... langLabels.noticeFetching } />
            </p>
          )}
          {step === `txInfo` && (
            <Fragment>
              <h1>
                <FormattedMessage id="BTCMS_ConfirmTxTitle" defaultMessage="Подтверждение транзакции" />
              </h1>
              <h3>
                <button onClick={ () => { this.setState({debugShowInput: !debugShowInput}) } }>
                  <FormattedMessage id="BTCMS_ConfirmTxInputs" defaultMessage="Входы транзакции" />
                </button>
              </h3>
              {debugShowInput &&
              <pre>
                <code>
                  {
                    JSON.stringify(this.state.txData.input, false, 4)
                  }
                </code>
              </pre>
              }
              <h3>
                <button onClick={ () => { this.setState({debugShowOutput: !debugShowOutput}) } }>
                  <FormattedMessage id="BTCMS_ConfirmTxOutputs" defaultMessage="Выходы транзакции" />
                </button>
              </h3>
              {debugShowOutput &&
              <pre>
                <code>
                  {
                    JSON.stringify(this.state.txData.output, false, 4)
                  }
                </code>
              </pre>
              }
              <div>
                <Button brand onClick={this.handleConfirm}>
                  <FormattedMessage id="BTCMS_ConfirmTxSign" defaultMessage="Подписать транзакцию" />
                </Button>
              </div>
              <div styleName="buttonsHolder">
                <Button
                  styleName="buttonFull"
                  blue
                  onClick={this.handleFinish}
                  fullWidth
                >
                  <FormattedMessage { ... langLabels.confirmTx } />
                </Button>
                <Button
                  styleName="buttonFull"
                  blue
                  onClick={this.handleFinish}
                  fullWidth
                >
                  <FormattedMessage { ... langLabels.dismatchTx } />
                </Button>
              </div>
            </Fragment>
          )}
        </Fragment>
      </Modal>
    )
  }
}

window.showConfirm = (txData) => {
  actions.modals.open(constants.modals.BtcMultisignConfirmTx, {
    txData,
  })
}
