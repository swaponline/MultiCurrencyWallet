import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'
import { constants } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { getSiteData } from 'helpers'

import firestore from 'helpers/firebase/firestore'
import actions from 'redux/actions'
import { withRouter } from 'react-router'
import {
  hasSignificantBalance,
  hasNonZeroBalance,
  notTestUnit,
} from 'helpers/user'
import moment from 'moment'

import CSSModules from 'react-css-modules'
import stylesWallet from './Wallet.scss'

import Row from './Row/Row'
import Table from 'components/tables/Table/Table'
import { WithdrawButton } from 'components/controls'
import styles from 'components/tables/Table/Table.scss'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import PageSeo from 'components/Seo/PageSeo'
import PartialClosure from 'pages/PartialClosure/PartialClosure'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import KeyActionsPanel from 'components/KeyActionsPanel/KeyActionsPanel'
import SaveKeysModal from 'components/modals/SaveKeysModal/SaveKeysModal'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import Referral from 'components/Footer/Referral/Referral'

import config from 'app-config'


const isWidgetBuild = config && config.isWidget

@connect(({
  core: { hiddenCoinsList },
  user: {
    ethData,
    btcData,
    bchData,
    tokensData,
    eosData,
    telosData,
    ltcData,
    qtumData,
    // usdtOmniData,
    // nimData,
    // xlmData,
  },
  currencies: { items: currencies },
}) => {
  const tokens = (
    config && config.isWidget
      ? [config.erc20token.toUpperCase()]
      : Object.keys(tokensData).map(k => tokensData[k].currency)
  )

  const items = (
    config && config.isWidget ? [
      btcData,
      ethData,
      // usdtOmniData,
    ] : [
        btcData,
        bchData,
        ethData,
        eosData,
        telosData,
        ltcData,
        qtumData,
        // usdtOmniData,
        // nimData,
        // xlmData,
      ]
  )
    .map(data => data.currency)

  const currencyBalance = [
    btcData,
    bchData,
    ethData,
    eosData,
    telosData,
    ltcData,
    qtumData,
    // usdtOmniData,
    // nimData,
    // xlmData,
    ...Object.keys(tokensData).map(k => tokensData[k]),
  ]
    .map(({ balance, currency }) => ({
      balance,
      name: currency,
    }))

  return {
    tokens,
    items,
    currencyBalance,
    currencies,
    hiddenCoinsList: config && config.isWidget ? [] : hiddenCoinsList,
    userEthAddress: ethData.address,
    tokensData: {
      ethData,
      btcData,
      bchData,
      ltcData,
      eosData,
      telosData,
      qtumData,
      // usdtOmniData,
    },
  }
})
@injectIntl
@withRouter
@CSSModules(stylesWallet, { allowMultiple: true })
export default class Wallet extends Component {

  static propTypes = {
    currencies: PropTypes.array,
    hiddenCoinsList: PropTypes.array,
    history: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.string),
    tokens: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  constructor() {
    super()

    const { projectName } = getSiteData()

    this.state = {
      projectName,
      saveKeys: false,
      openModal: false,
      isShowingPromoText: false,
    };

  }


  componentWillMount() {
    actions.user.getBalances()
    // actions.analytics.dataEvent('open-page-balances')

    this.checkImportKeyHash()

    if (process.env.MAINNET) {
      localStorage.setItem(constants.localStorage.testnetSkip, false)
    } else {
      localStorage.setItem(constants.localStorage.testnetSkip, true)
    }

    const testSkip = JSON.parse(
      localStorage.getItem(constants.localStorage.testnetSkip)
    )
    const saveKeys = JSON.parse(
      localStorage.getItem(constants.localStorage.privateKeysSaved)
    )

    this.setState(() => ({
      testSkip,
      saveKeys,
    }))
  }

  componentWillReceiveProps() {
    const { currencyBalance } = this.props

    const hasAtLeastTenDollarBalance = hasSignificantBalance(currencyBalance)

    if (process.env.MAINNET && hasAtLeastTenDollarBalance) {
      this.setState({ isShowingPromoText: true })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const getComparableProps = props => ({
      items: props.items,
      currencyBalance: props.currencyBalance,
      tokens: props.tokens,
      currencies: props.currencies,
      hiddenCoinsList: props.hiddenCoinsList,
    })
    return (
      JSON.stringify({
        ...getComparableProps(this.props),
        ...this.state,
      }) !==
      JSON.stringify({
        ...getComparableProps(nextProps),
        ...nextState,
      })
    )
  }

  forceCautionUserSaveMoney = () => {
    const { currencyBalance } = this.props

    const hasNonZeroCurrencyBalance = hasNonZeroBalance(currencyBalance)
    const isNotTestUser = notTestUnit(currencyBalance)
    const doesCautionPassed = localStorage.getItem(
      constants.localStorage.wasCautionPassed
    )

    if (
      !doesCautionPassed &&
      (hasNonZeroCurrencyBalance || isNotTestUser) &&
      process.env.MAINNET
    ) {
      actions.modals.open(constants.modals.PrivateKeys, {})
    }
  };

  checkImportKeyHash = () => {
    const {
      history,
      intl: { locale },
    } = this.props

    const urlHash = history.location.hash
    const importKeysHash = '#importKeys'

    if (!urlHash) {
      return
    }

    if (urlHash !== importKeysHash) {
      return
    }

    localStorage.setItem(constants.localStorage.privateKeysSaved, true)
    localStorage.setItem(constants.localStorage.firstStart, true)

    actions.modals.open(constants.modals.ImportKeys, {
      onClose: () => {
        history.replace(localisedUrl(locale, '/'))
      },
    })
  };

  checkBalance = () => {
    const now = moment().format('HH:mm:ss DD/MM/YYYY')
    const lastCheck =
      localStorage.getItem(constants.localStorage.lastCheckBalance) || now
    const lastCheckMoment = moment(lastCheck, 'HH:mm:ss DD/MM/YYYY')

    const isFirstCheck = moment(now, 'HH:mm:ss DD/MM/YYYY').isSame(
      lastCheckMoment
    )
    const isOneHourAfter = moment(now, 'HH:mm:ss DD/MM/YYYY').isAfter(
      lastCheckMoment.add(1, 'hours')
    )

    const { ethData, btcData, bchData, ltcData } = this.props.tokensData

    const balancesData = {
      ethBalance: ethData.balance,
      btcBalance: btcData.balance,
      bchBalance: bchData.balance,
      ltcBalance: ltcData.balance,
      ethAddress: ethData.address,
      btcAddress: btcData.address,
      bchAddress: bchData.address,
      ltcAddress: ltcData.address,
    }

    if (isOneHourAfter || isFirstCheck) {
      localStorage.setItem(constants.localStorage.lastCheckBalance, now)
      firestore.updateUserData(balancesData)
    }
  };

  render() {
    const {
      items,
      tokens,
      currencies,
      hiddenCoinsList,
      intl,
      location,
    } = this.props
    const { isShowingPromoText, projectName } = this.state

    this.checkBalance()
    const titles = [
      <FormattedMessage id="Wallet114" defaultMessage="Coin" />,
      <FormattedMessage id="Wallet115" defaultMessage="Name" />,
      <FormattedMessage id="Wallet116" defaultMessage="Balance" />,
      <FormattedMessage id="Wallet117" defaultMessage="Your Address" />,
      isMobile ? (
        <FormattedMessage id="Wallet118" defaultMessage="Send, receive, swap" />
      ) : (
          <FormattedMessage id="Wallet119" defaultMessage="Actions" />
        ),
    ]

    const titleSwapOnline = defineMessages({
      metaTitle: {
        id: 'Wallet140',
        defaultMessage:
          '{projectName} - Cryptocurrency Wallet with Atomic Swap Exchange',
      },
    })
    const titleWidgetBuild = defineMessages({
      metaTitle: {
        id: 'WalletWidgetBuildTitle',
        defaultMessage: 'Cryptocurrency Wallet with Atomic Swap Exchange',
      },
    })
    const title = isWidgetBuild ? titleWidgetBuild : titleSwapOnline

    const description = defineMessages({
      metaDescription: {
        id: 'Wallet146',
        defaultMessage: `Our online wallet with Atomic swap algorithms will help you store and exchange cryptocurrency instantly
        and more secure without third-parties. Decentralized exchange.`,
      },
    })

    const sectionWalletStyleName = isMobile
      ? 'sectionWalletMobile'
      : 'sectionWallet'

    this.forceCautionUserSaveMoney()

    const tableRows = [...items, ...tokens].filter(currency => !hiddenCoinsList.includes(currency))

    return (
      <section
        styleName={
          isWidgetBuild
            ? `${sectionWalletStyleName} ${sectionWalletStyleName}_widget`
            : sectionWalletStyleName
        }
      >
        <PageSeo
          location={location}
          defaultTitle={intl.formatMessage(title.metaTitle)}
          defaultDescription={intl.formatMessage(description.metaDescription)}
        />
        <PageHeadline
          styleName={isWidgetBuild ? 'pageLine pageLine_widget' : 'pageLine'}
        >
          <SubTitle>
            <FormattedMessage
              id="Wallet104"
              defaultMessage="Your online cryptocurrency wallet"
            />
          </SubTitle>
        </PageHeadline>
        <KeyActionsPanel />

        {!isShowingPromoText && (
          <div styleName="depositText">
            <FormattedMessage
              id="Wallet137"
              defaultMessage="Deposit funds to addresses below"
            />
          </div>
        )}

        <Table
          id="table-wallet"
          className={styles.wallet}
          titles={titles}
          rows={tableRows}
          rowRender={(row, index, selectId, handleSelectId) => (
            <Row
              key={row}
              index={index}
              currency={row}
              currencies={currencies}
              hiddenCoinsList={hiddenCoinsList}
              selectId={selectId}
              handleSelectId={handleSelectId}
            />
          )}
        />
        {config && !config.isWidget && (
          <div styleName="inform">
            <Referral address={this.props.userEthAddress} />
            <h2 styleName="informHeading">
              <FormattedMessage
                id="Wallet364"
                defaultMessage="Wallet based on the Atomic Swap technology"
              />
            </h2>
            <FormattedMessage
              id="Wallet156"
              // eslint-disable-next-line
              defaultMessage="Welcome to {project}, a decentralized cross-chain wallet based on Atomic Swap technology.{br}Here you can safely store and promptly exchange Bitcoin, Ethereum, EOS, USD, Tether, BCH, and numerous ERC-20 tokens.{br}{br}{project} doesn’t store your keys or tokens. Our wallet operates directly within your browser, so no additional installations or downloads are required.{br}The {project} service is fully decentralized.  All operations with tokens are executed via the IPFS network.{br}{br}Our team was the first to finalize Atomic Swaps with USDT and EOS in September 2018 and Litecoin blockchain was added in October 2018.{br}Our wallet addresses real multi-chain integration with a decentralized order book - no third party involved in the exchange, no proxy-token and no token wrapping.{br}We can integrate any ERC-20 token of a project for free!  We just ask for a mutually beneficial PR announcement!{br}{br}In addition, we developed Swap.Button, a b2b-solution to exchange all kinds of tokens for Bitcoin and Ethereum.{br}Install Swap.Button html widget on your site and collect crypto investments for your project.{br}{br}Start using https://swap.online/ today and enjoy the power of true decentralization."
              values={{
                br: <br />,
                project: projectName,
              }}
            />
          </div>
        )}
      </section>
    )
  }
}
