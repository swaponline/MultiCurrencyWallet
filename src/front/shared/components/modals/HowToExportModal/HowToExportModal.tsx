import React from 'react'

import cssModules from 'react-css-modules'
import styles from './HowToExportModal.scss'

import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import config from 'helpers/externalConfig'
import ethToken from 'helpers/ethToken'
import getCurrencyKey from 'helpers/getCurrencyKey'
import { connect } from 'redaction'


const langPrefix = `HowToExportModal`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_Title`,
    defaultMessage: 'Как экспортировать кошелек {currency}',
  },
  exportSimpleKey: {
    id: `${langPrefix}_ExportSimple`,
    defaultMessage: 'Для экспорта кошелька {currency} используйте ваш приватный ключ',
  },
  userPrivateKey: {
    id: `${langPrefix}_ExportUserPrivateKey`,
    defaultMessage: 'Ваш приватный ключ',
  },
  userEthPrivateKey: {
    id: `${langPrefix}_ExportEthPrivateKey`,
    defaultMessage: 'Ваш приватный ключ от ETH кошелька',
  },
  exportERC20Step1: {
    id: `${langPrefix}_ExportERC20Step1`,
    defaultMessage: 'Для экспорта кошелька {currency} вам нужно сначала импортировать ваш приватный ключ от ETH кошелька (в примеру в кошелек Metamask)',
  },
  exportERC20Step2: {
    id: `${langPrefix}_ExportERC20Step2`,
    defaultMessage: 'После экспорта ETH кошелька, вам нужно добавить ERC20 токен с параметрами, указанными ниже',
  },
  exportERC20Contract: {
    id: `${langPrefix}_ExportERC20_Contract`,
    defaultMessage: 'Адресс контракта: {contractAddress}',
  },
  exportERC20Symbol: {
    id: `${langPrefix}_ExportERC20_Symbol`,
    defaultMessage: 'Символ токена: {symbol}',
  },
  exportERC20Decimals: {
    id: `${langPrefix}_ExportERC20_Decimals`,
    defaultMessage: 'Количество символов после запятой: {decimals}',
  },
  exportERC20Name: {
    id: `${langPrefix}_ExportERC20_Name`,
    defaultMessage: 'Название токена: {name}',
  },
})

@connect(
  (
    {
      user: {
        ethData: {
          privateKey,
        }
      }
    }
  ) => ({
    ethPrivateKey: privateKey,
  })
)
@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class HowToExportModal extends React.Component {

  props: any

  constructor(props) {
    super(props)
    const {
      data: {
        item,
      },
      ethPrivateKey,
    } = props

    const currencyKey = getCurrencyKey(item.currency).toUpperCase()
    const isERC20Token = ethToken.isEthToken({ name: item.currency })

    this.state = {
      currencyKey,
      isERC20Token,
      item,
    }
  }

  render() {
    const {
      props: {
        name,
        intl,
        ethPrivateKey,
      },
      state: {
        currencyKey,
        isERC20Token,
        item,
        item: {
          privateKey,
          currency,
        },
      },
    } = this

    return (
      <Modal
        name={name}
        title={intl.formatMessage(langLabels.title, { currency })}
      >
        {(currencyKey === 'BTC' || currencyKey === 'ETH' || currencyKey === 'GHOST' || currencyKey === 'NEXT') && (
          <>
            <div styleName="instruction">
              <FormattedMessage
                { ...langLabels.exportSimpleKey }
                values={{
                  currency,
                }}
              />
            </div>
            <div styleName="privateKey" className="ym-hide-content">
              <FormattedMessage { ...langLabels.userPrivateKey } />
              <strong>{privateKey}</strong>
            </div>
          </>
        )}
        {isERC20Token && (
          <>
            <div styleName="instruction">
              <FormattedMessage
                { ...langLabels.exportERC20Step1 }
                values={{
                  currency,
                }}
              />
            </div>
            <div styleName="privateKey" className="ym-hide-content">
              <FormattedMessage { ...langLabels.userEthPrivateKey } />
              <strong>{ethPrivateKey}</strong>
            </div>
            <div styleName="instruction">
              <FormattedMessage
                { ...langLabels.exportERC20Step2 }
              />
            </div>
            <div styleName="tokenInfo">
              <FormattedMessage { ...langLabels.exportERC20Contract } values={{ contractAddress: item.contractAddress }} />
              <FormattedMessage { ...langLabels.exportERC20Symbol } values={{ symbol: item.currency }} />
              <FormattedMessage { ...langLabels.exportERC20Decimals } values={{ decimals: item.decimals }} />
              <FormattedMessage { ...langLabels.exportERC20Name } values={{ name: item.fullName }} />
            </div>
          </>
        )}
      </Modal>
    )
  }
}
