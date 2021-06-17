import { PureComponent } from 'react'
import { connect } from 'redaction'
import actions from 'redux/actions'
import { withRouter } from 'react-router-dom'
import { links, constants } from 'helpers'
import { injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'

type InvoceProps = {
  data: IUniversalObj
  history: IUniversalObj
  intl: IUniversalObj
  match: IUniversalObj
}

type InvoceState = {
  doshare: boolean
  isFetching: boolean
  uniqhash: string
  invoice: IUniversalObj | null
  infoModal?: React.ClassicComponent
}

@withRouter
class Invoice extends PureComponent<InvoceProps, InvoceState> {
  constructor(props) {
    super(props)

    const {
      match: {
        params: {
          uniqhash = null,
          doshare = false,
        },
      },
    } = props

    this.state = {
      uniqhash,
      invoice: null,
      isFetching: true,
      doshare,
    }
  }

  fetchInvoice = () => {
    const { uniqhash, infoModal } = this.state
    const { history, intl: { locale } } = this.props

    if(uniqhash) {
      //@ts-ignore: strictNullChecks
      infoModal.setState({
        isFetching: true,
        uniqhash,
      }, () => {
        actions.invoices.getInvoice(
          uniqhash
        ).then((invoice) => {
          if (invoice) {
            //@ts-ignore: strictNullChecks
            infoModal.setState({
              isFetching: false,
              invoice,
            })
          } else {
            history.push(localisedUrl(locale, links.notFound))
          }
        })
      })
    }
  }

  async componentDidMount() {
    const {
      uniqhash,
      doshare,
    } = this.state

    const { history, intl: { locale } } = this.props

    actions.modals.open(constants.modals.InfoInvoice, {
      onClose: (isLocationChange) => {
        if (!isLocationChange) {
          history.push(localisedUrl(locale, links.invoices))
        }
      },
      isFetching: true,
      uniqhash,
      doshare,
      onFetching: (infoModal) => {
        this.setState({
          infoModal,
        }, () => {
          this.fetchInvoice()
        })
      }
    })
  }

  componentDidUpdate(prevProps) {
    let {
      match: {
        params: {
          uniqhash = null,
          doshare = false,
        },
      },
    } = this.props

    let {
      match: {
        params: {
          uniqhash: prevUniqhash = null,
          doshare: prevDoshare = false,
        },
      },
    } = prevProps

    if ((prevUniqhash !== uniqhash)
      || (prevDoshare !== doshare)
    ) {
      const { infoModal } = this.state

      this.setState({
        uniqhash,
        doshare,
      }, () => {
        //@ts-ignore: strictNullChecks
        infoModal.setState((prevUniqhash !== uniqhash) ? {
          invoice: false,
          uniqhash,
          isFetching: true,
          doshare,
          isShareReady: !(doshare),
        } : {
          doshare,
          isShareReady: !(doshare),
        } , () => {
          this.fetchInvoice()
        })
      })
    }
  }

  render() {
    return null
  }
}

export default injectIntl(Invoice)
