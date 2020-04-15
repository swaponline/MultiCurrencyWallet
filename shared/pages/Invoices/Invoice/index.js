import React, { PureComponent, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { Link, withRouter } from 'react-router-dom'

import { links, constants } from 'helpers'


import CSSModules from 'react-css-modules'
import styles from './styles.scss'


import PageSeo from 'components/Seo/PageSeo'
import { getSeoPage } from 'helpers/seo'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import config from 'helpers/externalConfig'



const isWidgetBuild = config && config.isWidget

const langPrefix = `InvoicesView`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_MetaTitle`,
    defaultMessage: `Swap.Online - Invoice #{number} - Web Wallet with Atomic Swap.`,
  },
  titleWidgetBuild: {
    id: `${langPrefix}_WidgetMetaTitle`,
    defaultMessage: `Invoice #{number} - Web Wallet with Atomic Swap.`,
  },
  metaDescription: {
    id: `${langPrefix}_MetaDescription`,
    defaultMessage: `Atomic Swap Wallet allows you to manage and securely exchange. Based on Multi-Sig and Atomic Swap technologies.`,
  },
})

@connect(({ signUp: { isSigned } }) => ({
  isSigned,
}))

@connect(({
  user: {
    btcData,
    ethData,
  },
}) => {
  return {
    data: {
      btc: btcData,
      eth: ethData,
    }
  }
})
@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class Invoice extends PureComponent {
  
  constructor(props) {
    super(props)

    const {
      match: {
        params: {
          uniqhash = null,
        },
      },
      intl: {
        locale,
      },
      history,
    } = props

    this.state = {
      uniqhash,
      invoice: false,
      isFetching: true
    }
  }

  handleGoWalletHome = () => {
    const { history, intl: { locale } } = this.props

    history.push(localisedUrl(locale, links.wallet))
  }

  fetchInvoice = () => {
    const {
      state: {
        uniqhash,
        infoModal,
      },
      props: {
        history,
        intl: {
          locale,
        },
      },
    } = this

    if(uniqhash) {
      infoModal.setState({
        isFetching: true,
      }, () => {
        actions.invoices.getInvoice(
          uniqhash
        ).then((invoice) => {
          if (invoice) {
            infoModal.setState({
              isFetching: false,
              invoice,
            })
          } else {
            history.push(localisedUrl(localName, links.notFound))
          }
        })
      })
    }
  }

  async componentWillMount() {
    actions.modals.open(constants.modals.InfoInvoice, {
      onClose: () => {
      },
      isFetching: true,
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
        },
      },
    } = this.props

    let {
      match: {
        params: {
          uniqhash: prevUniqhash = null,
        },
      },
    } = prevProps

    if (prevUniqhash !== uniqhash) {
      const { infoModal } = this.state
      this.setState({
        uniqhash
      }, () => {
        infoModal.setState({
          invoice: false,
          isFetching: true,
        }, () => {
          this.fetchInvoice()
        })
      })
    }
  }

  async componentWillUnmount() {}

  render() {
    const {
      uniqhash,
      isFetching,
      invoice,
    } = this.state

    return (
      <div>
        <h1>View invoice</h1>
        <div>uniqhash:{uniqhash}</div>
        {isFetching && (
          <div>Fetching</div>
        )}
      </div>
    )
  }
}
