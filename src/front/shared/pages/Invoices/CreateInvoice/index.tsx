import { PureComponent } from 'react'
import { connect } from 'redaction'
import { constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { injectIntl } from 'react-intl'
import actions from 'redux/actions'
import { links }    from 'helpers'

type CreateInvoiceProps = {
  history: IUniversalObj
  match: IUniversalObj
  data: IUniversalObj
}

@connect(({
  user: {
    btcData,
    ethData,
    ghostData,
    nextData,
  },
}) => {
  return {
    data: {
      btc: btcData,
      eth: ethData,
      ghost: ghostData,
      next: nextData,
    }
  }
})
@injectIntl
export default class CreateInvoice extends PureComponent<CreateInvoiceProps> {
  async componentDidMount() {
    let {
      match: {
        params: {
          type,
          wallet,
        },
      },
      data,
    } = this.props

    if (!data[type]) {
      data[type] = actions.core.getWallet({
        currency: type,
      })
    }

    if (type && wallet && data[type]) {
      const address = data[type].address

      actions.modals.open(constants.modals.InvoiceModal, {
        currency: type.toUpperCase(),
        toAddress: wallet,
        address,
        disableClose: true,
      })

      console.log(type)
      await actions.user.getInfoAboutCurrency([type.toUpperCase()]);

    } else {
      this.props.history.push(localisedUrl(links.notFound))
    }
  }

  render() {
    return null
  }
}
