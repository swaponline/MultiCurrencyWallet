import React, { PureComponent, Fragment } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'
import Slider from 'pages/Wallet/components/WallerSlider';
import { Link, withRouter } from 'react-router-dom'

import { links, constants, ethToken } from 'helpers'
import { getTokenWallet, getBitcoinWallet, getEtherWallet } from 'helpers/links'


import CSSModules from 'react-css-modules'
import styles from 'pages/CurrencyWallet/CurrencyWallet.scss'

import Row from 'pages/History/Row/Row'

import Table from 'components/tables/Table/Table'
import NotifyBlock from 'pages/Wallet/components/NotityBlock/NotifyBock'
import PageSeo from 'components/Seo/PageSeo'
import { getSeoPage } from 'helpers/seo'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'
import { localisedUrl } from 'helpers/locale'
import config from 'helpers/externalConfig'
import BalanceForm from 'components/BalanceForm/BalanceForm'
import { BigNumber } from 'bignumber.js'
import ContentLoader from 'components/loaders/ContentLoader/ContentLoader'
import getCurrencyKey from 'helpers/getCurrencyKey'


const isWidgetBuild = config && config.isWidget

const langPrefix = `InvoicesList`
const langLabels = defineMessages({
  title: {
    id: `${langPrefix}_MetaTitle`,
    defaultMessage: `Swap.Online - Invoices - Web Wallet with Atomic Swap.`,
  },
  titleWidgetBuild: {
    id: `${langPrefix}_WidgetMetaTitle`,
    defaultMessage: `Invoices - Web Wallet with Atomic Swap.`,
  },
  metaDescription: {
    id: `${langPrefix}_MetaDescription`,
    defaultMessage: `Atomic Swap Wallet allows you to manage and securely exchange. Based on Multi-Sig and Atomic Swap technologies.`,
  },
  navTitle: {
    id: `${langPrefix}_NavTitle_All`,
    defaultMessage: `Invoices`,
  },
  navTitleAddress: {
    id: `${langPrefix}_NavTitle_Address`,
    defaultMessage: `Invoices {type}{br}{address}`,
  },
})

@connect(({ signUp: { isSigned } }) => ({
  isSigned,
}))

@connect(({
  user: {
    btcData,
    ethData,
    multisigStatus,
  },
}) => {
  return {
    data: {
      btc: btcData,
      eth: ethData,
    },
    multisigStatus,
  }
})
@injectIntl
@withRouter
@CSSModules(styles, { allowMultiple: true })
export default class InvoicesList extends PureComponent {
  unmounted = false

  constructor(props) {
    super(props)

    const {
      match: {
        params: {
          type = null,
          address = null,
        },
      },
      intl: {
        locale,
      },
      history,
    } = props

    this.state = {
      type,
      address,
      items: false,
    }
  }

  handleGoWalletHome = () => {
    const { history, intl: { locale } } = this.props

    history.push(localisedUrl(locale, links.wallet))
  }

  fetchItems = () => {
    const {
      type,
      address,
    } = this.state

    if (type && address) {
      // Fetch for one wallet
      actions.invoices.getInvoices({
        currency: type,
        address,
      }).then((items) => {
        if (!this.unmounted) {
          this.setState({ items })
        }
      })
    } else {
      // Fetch for all my wallets
      const wallets = actions.core.getWallets()
      const invoicesData = wallets.map((wallet) => {
        const {
          currency: type,
          address,
        } = wallet

        return {
          type,
          address,
        }
      })
      actions.invoices.getManyInvoices(invoicesData).then((items) => {
        if (!this.unmounted) {
          this.setState({ items })
        }
      })
    }
  }

  async componentWillUnmount() {
    this.unmounted = true
  }

  async componentWillMount() {
    this.fetchItems()
  }

  componentDidUpdate(prevProps) {
    let {
      match: {
        params: {
          type = null,
          address = null,
        },
      },
    } = this.props

    let {
      match: {
        params: {
          address: prevAddress = null,
          type: prevType = null,
        },
      },
    } = prevProps

    if ((prevAddress !== address) || (prevType !== type)) {
      this.setState({
        type,
        address,
        items: false,
      }, () => {
        this.fetchItems()
      })
    }
  }

  async componentWillUnmount() { }

  rowRender = (row, rowIndex) => (
    <Row key={rowIndex} {...row} viewType="invoice" />
  )

  render() {
    let {
      swapHistory,
      txHistory,
      location,
      intl,
      isSigned,
      onlyTable,
      multisigStatus,
    } = this.props

    const {
      isRedirecting,
      items,
      type,
      address,
    } = this.state

    if (isRedirecting) return null

    const seoPage = getSeoPage(location.pathname)

    const metaTitle = (isWidgetBuild) ? langLabels.titleWidgetBuild : langLabels.title


    let settings = {
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 6000,
      fade: true,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    const invoicesTable = (
      <div styleName="currencyWalletActivity">
        <h3>
          {(address) ? (
            <FormattedMessage {...langLabels.navTitleAddress} values={{
              type,
              address,
              br: <br />,
            }} />
          ) : (
              <FormattedMessage {...langLabels.navTitle} />
            )}
        </h3>
        {(items && items.length > 0) ? (
          <Table rows={items} styleName="currencyWalletSwapHistory" rowRender={this.rowRender} />
        ) : (
            <ContentLoader rideSideContent empty inner />
          )}
      </div>
    )

    if (onlyTable) {
      return invoicesTable
    }

    return (
      <div styleName="root">
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(metaTitle)}
          defaultDescription={intl.formatMessage(langLabels.metaDescription)} />
        <Slider
          settings={settings}
          multisigStatus={multisigStatus}
          isSigned={isSigned}
          {...this.state}
        />
        {isWidgetBuild && !config.isFullBuild && (
          <ul styleName="widgetNav">
            <li styleName="widgetNavItem" onClick={this.handleGoWalletHome}>
              <a href styleName="widgetNavItemLink">
                <FormattedMessage id="MybalanceswalletNav" defaultMessage="Мои кошельки" />
              </a>
            </li>
            <li styleName="widgetNavItem active">
              <a href styleName="widgetNavItemLink">
                <FormattedMessage {...langLabels.navTitle} />
              </a>
            </li>
          </ul>
        )}
        <Fragment>
          <div styleName="currencyWalletWrapper">
            <div styleName="currencyWalletBalance">
              {(items && items.length > 0) ? (
                <div>
                  {/* Right form holder */}
                </div>
              ) : (
                  <ContentLoader leftSideContent />
                )}
            </div>
            <div styleName="currencyWalletActivityWrapper">
              {invoicesTable}
            </div>
          </div>
          {
            seoPage && seoPage.footer && <div>{seoPage.footer}</div>
          }
        </Fragment>
      </div>
    )
  }
}
