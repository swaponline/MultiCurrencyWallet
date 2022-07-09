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
    bnbData,
    maticData,
    arbethData,
    aurethData,
    xdaiData,
    ftmData,
    avaxData,
    movrData,
    oneData,
    ghostData,
    nextData,
    phiData,
    ameData,
  },
}) => {
  return {
    data: {
      btc: btcData,
      eth: ethData,
      bnb: bnbData,
      matic: maticData,
      arbeth: arbethData,
      aureth: aurethData,
      xdai: xdaiData,
      ftm: ftmData,
      avax: avaxData,
      movr: movrData,
      one: oneData,
      ghost: ghostData,
      next: nextData,
      phi: phiData,
      ame: ameData,
    }
  }
})
class CreateInvoice extends PureComponent<CreateInvoiceProps> {
  constructor(props) {
    super(props)
  }

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

      //@ts-ignore: strictNullChecks
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

export default injectIntl(CreateInvoice)
