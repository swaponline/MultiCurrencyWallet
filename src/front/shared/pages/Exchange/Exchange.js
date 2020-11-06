import React, { Component, Fragment } from "react"

import Link from "sw-valuelink"

import ReactTooltip from 'react-tooltip'
import CSSModules from "react-css-modules"
import styles from "./Exchange.scss"

import { connect } from "redaction"
import actions from "redux/actions"
import { BigNumber } from "bignumber.js"
import { Redirect } from "react-router-dom"
import { getState } from "redux/core"
import reducers from "redux/core/reducers"
import { isMobile } from 'react-device-detect'

import SelectGroup from "./SelectGroup/SelectGroup"
import { Button } from "components/controls"
import Promo from "./Promo/Promo"
import Quote from "./Quote"
import HowItWorks from "./HowItWorks/HowItWorks"
import VideoAndFeatures from "./VideoAndFeatures/VideoAndFeatures"
import Tooltip from "components/ui/Tooltip/Tooltip"
import InlineLoader from "components/loaders/InlineLoader/InlineLoader"
import { FormattedMessage, injectIntl } from "react-intl"
import { localisedUrl } from "helpers/locale"
import config from "helpers/externalConfig"
import SwapApp, { util } from "swap.app"

import helpers, { constants, links } from "helpers"
import feedback from 'shared/helpers/feedback'
import { animate } from "helpers/domUtils"
import Switching from "components/controls/Switching/Switching"
import AddressSelect from "./AddressSelect/AddressSelect"
import { AddressType, AddressRole } from "domain/address"
import NetworkStatus from 'components/NetworkStatus/NetworkStatus'
import Orders from "./Orders/Orders"

import { getPairFees } from 'helpers/getPairFees'



const allowedCoins = [
  ...(!config.opts.curEnabled || config.opts.curEnabled.btc ? ["BTC"] : []),
  ...(!config.opts.curEnabled || config.opts.curEnabled.eth ? ["ETH"] : []),
  ...(!config.opts.curEnabled || config.opts.curEnabled.ghost ? ["GHOST"] : []),
  ...(!config.opts.curEnabled || config.opts.curEnabled.next ? ["NEXT"] : []),
];

const isDark = localStorage.getItem(constants.localStorage.isDark)

const isExchangeAllowed = (currencies) =>
  currencies.filter((c) => {
    const isErc = Object.keys(config.erc20)
      .map((i) => i.toLowerCase())
      .includes(c.value.toLowerCase());

    const isAllowedCoin = allowedCoins
      .map((i) => i.toLowerCase())
      .includes(c.value.toLowerCase());

    return isAllowedCoin || isErc;
  });

const filterIsPartial = (orders) =>
  orders
    .filter(
      (order) => order.isPartial && !order.isProcessing && !order.isHidden
    )
    .filter(
      (order) => order.sellAmount !== 0 && order.sellAmount.isGreaterThan(0)
    ) // WTF sellAmount can be not BigNumber
    .filter(
      (order) => order.buyAmount !== 0 && order.buyAmount.isGreaterThan(0)
    ); // WTF buyAmount can be not BigNumber too - need fix this

const text = [
  <FormattedMessage
    id="partial223"
    defaultMessage="To change default wallet for buy currency. "
  />,
  <FormattedMessage
    id="partial224"
    defaultMessage="Leave empty for use Swap.Online wallet "
  />,
];

const subTitle = (sell, sellTicker, buy, buyTicker) => (
  <div>
    <FormattedMessage
      id="ExchangeTitleTag1"
      defaultMessage="Fastest cross-chain atomic swaps"
    />
    <span styleName="tooltipHeader">
      <Tooltip id="partialAtomicSwapWhatIsIt1" dontHideMobile place="bottom">
        <FormattedMessage
          id="partialAtomicSwapWhatIsIt"
          defaultMessage="Atomic swap is a smart contract technology that enables exchange."
        />
      </Tooltip>
    </span>
  </div>
);

const isWidgetBuild = config && config.isWidget;
const bannedPeers = {}; // rejected swap peers



@injectIntl
@connect(
  ({
    currencies,
    addSelectedItems,
    rememberedOrders,
    addPartialItems,
    history: { swapHistory },
    core: { orders, hiddenCoinsList },
    user: { ethData, btcData, ghostData, nextData, tokensData, activeFiat, ...rest },
  }) => ({
    currencies: isExchangeAllowed(currencies.partialItems),
    allCurrencyies: currencies.items,
    addSelectedItems: isExchangeAllowed(currencies.addPartialItems),
    orders: filterIsPartial(orders),
    allOrders: orders,
    currenciesData: [ethData, btcData, ghostData, nextData],
    tokensData: [...Object.keys(tokensData).map((k) => tokensData[k])],
    decline: rememberedOrders.savedOrders,
    hiddenCoinsList,
    userEthAddress: ethData.address,
    swapHistory,
    activeFiat,
    usersData: [
      ethData,
      btcData,
      ghostData,
      nextData,
      ...Object.values(tokensData).filter(({ address }) => address),
      ...Object.values(rest)
        .filter(( coinData ) => coinData && coinData.address)
        .filter(({ address }) => address)
    ],
  })
)
@CSSModules(styles, { allowMultiple: true })
export default class Exchange extends Component {
  _mounted = false

  static defaultProps = {
    orders: [],
  };

  static getDerivedStateFromProps(
    { orders, match: { params } },
    { haveCurrency, getCurrency }
  ) {
    if (!Array.isArray(orders)) {
      return;
    }

    const filteredOrders = orders.filter(
      (order) =>
        !order.isMy &&
        order.sellCurrency === getCurrency.toUpperCase() &&
        order.buyCurrency === haveCurrency.toUpperCase()
    );

    return {
      filteredOrders,
    };
  }

  constructor(props) {
    const {
      tokensData,
      allCurrencyies,
      currenciesData,
      match,
      intl: { locale },
      history,
    } = props;
    super();

    this.fiatRates = {}
    this.onRequestAnswer = (newOrder, isAccepted) => { };

    const isRootPage =
      history.location.pathname === "/" || history.location.pathname === "/ru";
    const {
      url,
      params: { buy, sell },
    } = match || { params: { buy: "btc", sell: "usdt" } };

    if (sell && buy && !isRootPage) {
      if (
        !allCurrencyies.map((item) => item.name).includes(sell.toUpperCase()) ||
        !allCurrencyies.map((item) => item.name).includes(buy.toUpperCase())
      ) {
        history.push(localisedUrl(locale, `${links.exchange}/eth-to-btc`));
      }
    }

    const haveCurrency = sell || "btc";
    const getCurrency = buy || (!isWidgetBuild ? "eth" : config.erc20token);

    this.returnNeedCurrency(haveCurrency, getCurrency);

    if (
      !(buy && sell) &&
      !props.location.hash.includes("#widget") &&
      !isRootPage
    ) {
      if (url !== "/wallet") {
        history.push(
          localisedUrl(locale, `${links.exchange}/${haveCurrency}-to-${getCurrency}`)
        )
      }
    }

    this.state = {
      isToken: false,
      dynamicFee: 0,
      haveCurrency,
      getCurrency,
      haveAmount: 0,
      getAmount: "",
      fromAddress: null,
      toAddress: null,
      haveFiat: 0,
      getFiat: 0,
      isShowBalance: true,
      isLowAmount: false,
      maxAmount: 0,
      maxBuyAmount: new BigNumber(0),
      peer: "",
      goodRate: 0,
      filteredOrders: [],
      isNonOffers: false,
      isDeclinedOffer: false,
      extendedControls: false,
      isWaitForPeerAnswer: false,
      desclineOrders: [],
      pairFees: false,
      balances: false,
      balanceOnWalletsIsOk: false,
    }

    if (config.isWidget) {
      this.state.getCurrency = config.erc20token
    }
  }

  componentDidMount() {
    this._mounted = true

    const { haveCurrency, getCurrency } = this.state

    actions.core.updateCore()
    this.returnNeedCurrency(haveCurrency, getCurrency)
    this.checkPair()

    this.getFiatBalance()

    this.timer = true;
    const timerProcess = () => {
      if (!this.timer) return
      this.setOrders()
      this.checkUrl()
      this.getCorrectDecline()
      setTimeout(timerProcess, 2000);
    };
    timerProcess()

    SwapApp.shared().services.room.on("new orders", () => this.checkPair())

    document.addEventListener("scroll", this.rmScrollAdvice)

    setTimeout(() => {
      if (this._mounted) {
        this.setState({
          isFullLoadingComplite: true,
        })
      }
    }, 60 * 1000)

    this.fetchPairFeesAndBalances()
  }

  getBalance(currency) {
    const {
      balances,
    } = this.state

    return (balances && balances[currency.toUpperCase()]) ? balances[currency.toUpperCase()] : 0
  }

  fetchPairFeesAndBalances() {
    const {
      haveCurrency: sellCurrency,
      getCurrency: buyCurrency,
    } = this.state

    if (!this._mounted) return
    this.setState({
      pairFees: false,
      balances: false,
    }, () => {
      if (!this._mounted) return
      getPairFees(sellCurrency, buyCurrency).then(async (pairFees) => {
        const buyExRate = await this.fetchFiatExRate(pairFees.buy.coin)
        const sellExRate = await this.fetchFiatExRate(pairFees.sell.coin)
        if (!this._mounted) return
        this.setState({
          pairFees: {
            ...pairFees,
            buyExRate,
            sellExRate,
          },
        }, async () => {
          if (!this._mounted) return
          // After fetching fee - actualize balances
          const buyWallet = actions.core.getWallet({ currency: buyCurrency })
          const sellWallet = actions.core.getWallet({ currency: sellCurrency })
          const feeBuyWallet = actions.core.getWallet({ currency: pairFees.buy.coin })
          const feeSellWallet = actions.core.getWallet({ currency: pairFees.sell.coin })

          const balances = {}
          balances[`${buyWallet.currency}`] = await actions.core.fetchWalletBalance(buyWallet)
          balances[`${sellWallet.currency}`] = await actions.core.fetchWalletBalance(sellWallet)
          if (balances[`${feeBuyWallet.currency}`] === undefined) {
            balances[`${feeBuyWallet.currency}`] = await actions.core.fetchWalletBalance(feeBuyWallet)
          }
          if (balances[`${feeSellWallet.currency}`] === undefined) {
            balances[`${feeSellWallet.currency}`] = await actions.core.fetchWalletBalance(feeSellWallet)
          }

          this.setState({
            balances,
          })
        })
      })
    })
  }

  rmScrollAdvice = () => {
    if (window.scrollY > window.innerHeight * 0.7 && this.scrollTrigger) {
      this.scrollTrigger.classList.add("hidden");
      document.removeEventListener("scroll", this.rmScrollAdvice);
    }
  };

  componentWillUnmount() {
    this._mounted = false
    this.timer = false
  }

  checkUrl = () => {
    const {
      match: {
        params: {
          buy: buyValue,
          sell: sellValue,
        },
      },
    } = this.props

    const { getCurrency, haveCurrency } = this.state

    if (haveCurrency && sellValue && sellValue !== haveCurrency) {
      this.handleSetHaveValue({ value: sellValue })
    }

    if (getCurrency && sellValue && buyValue && buyValue !== getCurrency) {
      this.checkValidUrl(sellValue, buyValue)
    }
  }

  checkValidUrl = (sellValue, buyValue) => {
    const avaliablesBuyCurrency = actions.pairs
      .selectPairPartial(sellValue)
      .map((el) => el.value);
    if (avaliablesBuyCurrency.includes(buyValue)) {
      return this.handleSetGetValue({ value: buyValue });
    }
    if (avaliablesBuyCurrency.includes(sellValue)) {
      const filterSameVale = avaliablesBuyCurrency.filter(
        (el) => el !== sellValue
      );
      if (filterSameVale.includes("btc")) {
        this.handleSetGetValue({ value: "btc" });
      } else {
        this.handleSetGetValue({ value: filterSameVale[0] });
      }
    }
  };

  switchBalance = () => {
    this.setState({
      isShowBalance: !this.state.isShowBalance,
    });
  };

  changeUrl = (sell, buy) => {
    const {
      intl: { locale },
      isOnlyForm,
    } = this.props;

    if (!this.props.location.hash.includes("#widget") && !isOnlyForm) {
      this.props.history.push(
        localisedUrl(locale, `${links.exchange}/${sell}-to-${buy}`)
      );
    }
  };

  fetchFiatExRate = async (coin) => {
    const {
      activeFiat,
    } = this.props

    try {
      if (this.fiatRates[coin]) {
        return this.fiatRates[coin]
      } else {
        const exRate = await actions.user.getExchangeRate(coin, activeFiat)
        this.fiatRates[coin] = exRate
        return exRate
      }
    } catch (err) {
      console.error(`Cryptonator offline: Fail fetch ${coin} exRate for fiat ${activeFiat}`, err)
      return 0
    }
  }

  getFiatBalance = async () => {
    const {
      haveCurrency,
      getCurrency,
    } = this.state

    const exHaveRate = await this.fetchFiatExRate(haveCurrency)
    const exGetRate = await this.fetchFiatExRate(getCurrency)
    this.setState({
      exHaveRate,
      exGetRate,
    })
  }

  createOffer = async () => {
    feedback.createOffer.started()

    const { haveCurrency, getCurrency } = this.state

    actions.modals.open(constants.modals.Offer, {
      sellCurrency: haveCurrency,
      buyCurrency: getCurrency,
    })
    // actions.analytics.dataEvent('orderbook-click-createoffer-button')
  };

  /* Refactoring
   * Проверка возможности начать свап по указанной паре
   * Проверяет балан, фи, если свап не возможен - показывает сообщение
   */
  checkSwapAllow = (checkParams) => {
    const {
      sellCurrency,
      buyCurrency,
      amount,
      balance,
    } = checkParams

    const {
      pairFees,
      balances,
    } = this.state

    const isSellToken = helpers.ethToken.isEthToken( { name: sellCurrency } )

    let balanceIsOk = true
    if (
      isSellToken
      && (
        BigNumber(balance).isLessThan(amount)
        || BigNumber(balances.ETH).isLessThan(pairFees.byCoins.ETH.fee)
      )
    ) balanceIsOk = false

    // UTXO
    if (pairFees.byCoins[sellCurrency.toUpperCase()]
      && pairFees.byCoins[sellCurrency.toUpperCase()].isUTXO
    ) {
      if (
        BigNumber(balance).isLessThan(
          BigNumber(amount).plus(pairFees.byCoins[sellCurrency.toUpperCase()].fee)
        )
      ) balanceIsOk = false
    } else {
      if (!isSellToken
        && BigNumber(balance).isLessThan(amount)
      ) balanceIsOk = false
    }

    if (!balanceIsOk) {
      const { address } = actions.core.getWallet({ currency: sellCurrency })
      const {
        sell: {
          fee: sellFee,
          coin: sellCoin,
        },
        buy: {
          fee: buyFee,
          coin: buyCoin,
        },
      } = pairFees

      const alertMessage = (
        <Fragment>
          <FormattedMessage
            id="AlertOrderNonEnoughtBalance"
            defaultMessage="Please top up your balance before you start the swap."
          />
          <br />
          {isSellToken && (
            <FormattedMessage
              id="Swap_NeedEthFee"
              defaultMessage="На вашем балансе должно быть не менее {sellFee} {sellCoin} и {buyFee} {buyCoin} для оплаты коммисии майнера"
              values={{
                sellFee,
                sellCoin,
                buyFee,
                buyCoin,
              }}
            />
          )}
          {!isSellToken && (
            <FormattedMessage
              id="Swap_NeedMoreAmount"
              defaultMessage="На вашем балансе должно быть не менее {amount} {currency}. {br}Коммисия майнера {sellFee} {sellCoin} и {buyFee} {buyCoin}"
              values={{
                amount,
                currency: sellCurrency.toUpperCase(),
                sellFee,
                sellCoin,
                buyFee,
                buyCoin,
                br: <br />,
              }}
            />
          )}
        </Fragment>
      )
      actions.modals.open(constants.modals.AlertWindow, {
        title: <FormattedMessage
          id="AlertOrderNonEnoughtBalanceTitle"
          defaultMessage="Not enough balance."
        />,
        message: alertMessage,
        canClose: true,
        currency: buyCurrency,
        address,
        actionType: 'deposit',
      })
      return false
    }
    return true
  }

  // @ToDo - need refactiong without BTC
  initSwap = async () => {
    const { decline, usersData } = this.props;

    const {
      haveCurrency,
      haveAmount,
      getCurrency,
    } = this.state

    const haveTicker = haveCurrency.toUpperCase()
    const getTicker = getCurrency.toUpperCase()

    feedback.exchangeForm.requestedSwap(`${haveTicker}->${getTicker}`)

    if (!this.checkSwapAllow({
      sellCurrency: haveCurrency,
      buyCurrency: getCurrency,
      amount: haveAmount,
      balance: this.getBalance(haveCurrency),
    })) return false

    if (decline.length === 0) {
      this.sendRequestForPartial()
    } else {
      const declinedExistedSwapIndex = helpers.handleGoTrade.getDeclinedExistedSwapIndex({
        currency: haveCurrency,
        decline,
      });
      if (declinedExistedSwapIndex !== false) {
        this.openModalDeclineOrders(declinedExistedSwapIndex)
      } else {
        this.sendRequestForPartial()
      }
    }
  };

  openModalDeclineOrders = (indexOfDecline) => {
    const orders = SwapApp.shared().services.orders.items;
    const declineSwap = actions.core.getSwapById(
      this.props.decline[indexOfDecline]
    );

    if (declineSwap !== undefined) {
      actions.modals.open(constants.modals.DeclineOrdersModal, {
        declineSwap,
      });
    }
  };

  sendRequestForPartial = () => {
    const {
      peer,
      orderId,
      fromAddress,
      toAddress,
      haveAmount,
      getAmount,
      maxAmount,
      maxBuyAmount,
    } = this.state;

    console.log('>>> Exchange: sendRequestForPartial', haveAmount, getAmount)
    console.log(`${haveAmount} FROM ${fromAddress.value}`)
    console.log(`${getAmount} TO ${toAddress.value}`)

    if (!String(getAmount) || !peer || !orderId || !String(haveAmount)) {
      return;
    }

    const newValues = {
      sellAmount: maxBuyAmount.isEqualTo(haveAmount) ? maxAmount : getAmount,
    };

    const destination = {
      address: toAddress.value,
    };

    this.setState(() => ({ isWaitForPeerAnswer: true }));

    // wait until not skip and ban peer
    const requestTimeoutSec = config && config.isWidgetBuild ? 60 : 30;

    const requestTimeout = setTimeout(() => {
      this.banPeer(peer);
      this.getLinkToDeclineSwap(peer);
      this.setDeclinedOffer();
    }, requestTimeoutSec * 1000);

    this.onRequestAnswer = (newOrder, isAccepted) => {
      clearTimeout(requestTimeout);
      if (isAccepted) {
        this.setState(() => ({
          redirectToSwap: true,
          orderId: newOrder.id,
          isWaitForPeerAnswer: false,
        }));
      } else {
        this.banPeer(peer);
        this.getLinkToDeclineSwap(peer);
        this.setDeclinedOffer();
      }
    };

    actions.core.sendRequestForPartial(
      orderId,
      newValues,
      destination,
      this.onRequestAnswer
    );
  };

  getLinkToDeclineSwap = () => {
    const orders = SwapApp.shared().services.orders.items;

    const unfinishedOrder = orders
      .filter((item) => item.isProcessing === true)
      .filter((item) => item.participant)
      .filter((item) => item.participant.peer === this.state.peer)
      .filter(
        (item) => item.sellCurrency === this.state.getCurrency.toUpperCase()
      )[0];

    if (!unfinishedOrder) return;

    this.setState(() => ({
      wayToDeclinedOrder: `swaps/${unfinishedOrder.sellCurrency}-${unfinishedOrder.sellCurrency}/${unfinishedOrder.id}`,
    }));
  };

  returnNeedCurrency = (haveCurrency, getCurrency) => {
    const partialItems = Object.assign(getState().currencies.partialItems); // eslint-disable-line

    const partialCurrency = getState().currencies.partialItems.map(
      (item) => item.name
    );
    const allCurrencyies = getState().currencies.items.map((item) => item.name);
    let partialItemsArray = [...partialItems];
    let currenciesOfUrl = [];
    currenciesOfUrl.push(haveCurrency, getCurrency);

    currenciesOfUrl.forEach((item) => {
      if (allCurrencyies.includes(item.toUpperCase())) {
        if (!partialCurrency.includes(item.toUpperCase())) {
          partialItemsArray.push({
            name: item.toUpperCase(),
            title: item.toUpperCase(),
            icon: item.toLowerCase(),
            value: item.toLowerCase(),
          });
          reducers.currencies.updatePartialItems(partialItemsArray);
        }
      } else {
        this.setState(() => ({
          haveCurrency: config && config.isWidget ? config.erc20token : 'swap',
        }));
      }
    });
  };

  setDeclinedOffer = () => {
    this.setState(() => ({
      haveAmount: "",
      isWaitForPeerAnswer: false,
      isDeclinedOffer: true,
    }));

    setTimeout(() => {
      this.setState(() => ({
        isDeclinedOffer: false,
      }));
    }, 7 * 1000);
  };

  setNoOfferState = () => {
    this.setState(() => ({ isNonOffers: true }));
  };

  setAmountOnState = (maxAmount, getAmount, buyAmount) => {
    const { getCurrency, haveAmount } = this.state;
    const decimalPlaces = constants.tokenDecimals[getCurrency.toLowerCase()];

    this.setState(() => ({
      maxAmount: Number(maxAmount),
      getAmount: BigNumber(getAmount).dp(decimalPlaces).toString(),
      maxBuyAmount: buyAmount,
    }));

    return (
      BigNumber(getAmount).isLessThanOrEqualTo(maxAmount) ||
      BigNumber(haveAmount).isEqualTo(buyAmount)
    );
  };

  setAmount = (value) => {
    this.setState(() => ({ haveAmount: value, maxAmount: 0 }));
  };

  setOrders = async () => {
    const { filteredOrders, haveAmount, exHaveRate, exGetRate } = this.state;

    if (!filteredOrders.length) {
      this.setState(() => ({
        isNonOffers: true,
        isNoAnyOrders: true,
        maxAmount: 0,
        getAmount: 0,
        maxBuyAmount: BigNumber(0),
      }));
      return;
    }

    this.setState(() => ({
      isSearching: true,
    }));

    const sortedOrders = filteredOrders
      .sort(
        (a, b) =>
          Number(b.buyAmount.dividedBy(b.sellAmount)) -
          Number(a.buyAmount.dividedBy(a.sellAmount))
      )
      .map((item, index) => {
        const exRate = item.buyAmount.dividedBy(item.sellAmount);
        const getAmount = BigNumber(haveAmount).dividedBy(exRate).toString();

        return {
          sellAmount: item.sellAmount,
          buyAmount: item.buyAmount,
          exRate,
          getAmount,
          orderId: item.id,
          peer: item.owner.peer,
        };
      });

    const didFound = await this.setOrderOnState(sortedOrders);

    if (didFound) {
      this.setState(() => ({
        isSearching: false,
        isNoAnyOrders: false,
      }));
    }
  };

  setOrderOnState = (orders) => {
    const { haveAmount, getCurrency } = this.state;

    let maxAllowedSellAmount = BigNumber(0);
    let maxAllowedGetAmount = BigNumber(0);
    let maxAllowedBuyAmount = BigNumber(0);

    let isFound = false;
    let newState = {};

    const findGoodOrder = (inOrders) => {
      inOrders.forEach((item) => {
        maxAllowedSellAmount = maxAllowedSellAmount.isLessThanOrEqualTo(
          item.sellAmount
        )
          ? item.sellAmount
          : maxAllowedSellAmount;
        maxAllowedBuyAmount = maxAllowedBuyAmount.isLessThanOrEqualTo(
          item.buyAmount
        )
          ? item.buyAmount
          : maxAllowedBuyAmount;

        if (BigNumber(haveAmount).isLessThanOrEqualTo(item.buyAmount)) {
          maxAllowedGetAmount = maxAllowedGetAmount.isLessThanOrEqualTo(
            item.getAmount
          )
            ? BigNumber(item.getAmount)
            : maxAllowedGetAmount;

          isFound = true;

          newState = {
            isNonOffers: false,
            goodRate: item.exRate,
            peer: item.peer,
            orderId: item.orderId,
          };
        }
      });
    };

    findGoodOrder(orders.filter((order) => !this.isPeerBanned(order.peer)));

    if (!isFound) { // check banned peers
      findGoodOrder(orders.filter((order) => this.isPeerBanned(order.peer)));
    }

    if (isFound) {
      this.setState(() => newState);
    } else {
      this.setState(() => ({
        isNonOffers: true,
        getFiat: Number(0).toFixed(2),
      }));
    }

    const checkAmount = this.setAmountOnState(
      maxAllowedSellAmount,
      maxAllowedGetAmount,
      maxAllowedBuyAmount
    );

    if (!checkAmount) {
      this.setNoOfferState();
    }

    return true;
  };

  isPeerBanned(peerID) {
    if (
      bannedPeers[peerID] &&
      bannedPeers[peerID] > Math.floor(new Date().getTime() / 1000)
    ) {
      return true;
    }
    return false;
  }

  banPeer(peerID) {
    const bannedPeersTimeout = 180; // 3 mins
    bannedPeers[peerID] =
      Math.floor(new Date().getTime() / 1000) + bannedPeersTimeout;
  }

  handleSetGetValue = ({ value }) => {
    const {
      haveCurrency,
      getCurrency,
    } = this.state

    if (value === haveCurrency) {
      this.flipCurrency()
    } else {
      this.setState({
        getCurrency: value,
        haveCurrency,
        pairFees: false,
      }, () => {
        this.fetchPairFeesAndBalances()
        this.changeUrl(haveCurrency, value)
        actions.analytics.dataEvent({
          action: 'exchange-click-selector',
          label: `${haveCurrency}-to-${getCurrency}`,
        })
      })
    }
  }

  handleSetHaveValue = async ({ value }) => {
    const {
      haveCurrency,
      getCurrency,
    } = this.state

    if (value === getCurrency) {
      this.flipCurrency()
    } else {
      this.setState({
        haveCurrency: value,
        getCurrency,
        pairFees: false,
      }, () => {
        this.fetchPairFeesAndBalances()
        this.changeUrl(value, getCurrency);
        actions.analytics.dataEvent({
          action: 'exchange-click-selector',
          label: `${haveCurrency}-to-${getCurrency}`,
        });

        this.checkPair()
      })
    }
  }

  applyAddress = (addressRole, addressData) => {
    // address value or missing either already validated
    const { type, value, currency } = addressData;

    console.log('Exchange: applyAddress', addressRole, addressData)

    feedback.exchangeForm.selectedAddress(`${addressRole} ${currency.toUpperCase()} ${type}`)

    if (addressRole === AddressRole.Send) {

      this.setState({
        fromAddress: addressData
      })
    }
    if (addressRole === AddressRole.Receive) {
      this.setState({
        toAddress: addressData
      })
    }
  };

  flipCurrency = async () => {
    const {
      haveCurrency,
      getCurrency,
      exHaveRate,
      exGetRate,
      pairFees,
    } = this.state

    feedback.exchangeForm.flipped(`${haveCurrency}->${getCurrency} => ${getCurrency}->${haveCurrency}`)

    this.resetState()
    this.changeUrl(getCurrency, haveCurrency)
    this.setState({
      haveCurrency: getCurrency,
      getCurrency: haveCurrency,
      exHaveRate: exGetRate,
      exGetRate: exHaveRate,
      pairFees: {
        ...((pairFees) ? {
          // flip pair fees and exRates
          ...pairFees,
          buy: pairFees.sell,
          sell: pairFees.buy,
          have: pairFees.get,
          get: pairFees.have,
          buyExRate: pairFees.sellExRate,
          sellExRate: pairFees.buyExRate,
        } : []),
      },
      // todo: flip values, addresses
    },() => {
      actions.analytics.dataEvent({
        action: 'exchange-click-selector',
        label: `${haveCurrency}-to-${getCurrency}`,
      })
      this.checkPair()
    })
  };

  resetState = () => {
    this.setState(() => ({
      haveAmount: 0,
      haveHeat: 0,
      getHeat: 0,
      getAmount: "",
      maxAmount: 0,
      maxBuyAmount: BigNumber(0),
      peer: "",
      isNonOffers: false,
      isWaitForPeerAnswer: false,
      isDeclinedOffer: false,
    }));
  };

  checkPair = () => {
    const { getCurrency, haveCurrency } = this.state;

    const noPairToken = config && config.isWidget ? config.erc20token : 'swap'

    const checkingValue = this.props.allCurrencyies
      .map((item) => item.name)
      .includes(haveCurrency.toUpperCase())
      ? haveCurrency
      : noPairToken;

    const selected = actions.pairs.selectPairPartial(checkingValue);
    const check = selected.map((item) => item.value).includes(getCurrency);
    this.getFiatBalance();

    if (!check) {
      this.chooseCurrencyToRender(selected);
    } else if (getCurrency === checkingValue) {
      this.chooseCurrencyToRender(selected);
    }
  };

  chooseCurrencyToRender = (selected) => {
    this.setState(
      () => ({
        getCurrency: selected[0].value,
      }),
      () => {
        this.getFiatBalance();
      }
    );
  };

  checkoutLowAmount() {
    return (
      this.doesComissionPreventThisOrder() &&
      BigNumber(this.state.getAmount).isGreaterThan(0) &&
      this.state.haveAmount &&
      this.state.getAmount
    );
  }

  extendedControlsSet = (value) => {
    const { extendedControls } = this.state;

    if (typeof value !== "boolean") {
      return this.setState({ extendedControls: false });
    }
    if (extendedControls === value) {
      return false;
    }
    return this.setState({ extendedControls: value });
  };

  doesComissionPreventThisOrder = () => {
    const {
      pairFees,
      haveAmount,
      getAmount,
    } = this.state

    if (pairFees) {
      // @ToDo
      // Возможно нужно брать за расчет коммисию умноженную на два
      // Если минимум будет размер коммисии, то по факту
      // При выводе из скрипта покупатель получит ноль монет
      // (При списании со скрипта берется коммисия)
      const feeMultipler = 1
      if (pairFees.have.isUTXO
        && BigNumber(pairFees.have.fee).times(feeMultipler).isGreaterThanOrEqualTo(haveAmount)
      ) return true
      if (pairFees.get.isUTXO
        && BigNumber(pairFees.get.fee).times(feeMultipler).isGreaterThanOrEqualTo(getAmount)
      ) return true
    } else {
      /* No information for fee... wait - disable swap */
      return true
    }
    return false
  }

  goDeclimeFaq = () => {
    const faqLink = links.getFaqLink('requestDeclimed');
    if (faqLink) {
      window.location.href = faqLink;
    }
  };

  getCorrectDecline = () => {
    const {
      decline,
      swapHistory,
    } = this.props

    const localSavedOrdersString = localStorage.getItem('savedOrders')

    if (!localSavedOrdersString) return
    const localSavedOrders = JSON.parse(localSavedOrdersString)

    if (localSavedOrders.length !== decline.length) {
      return
    }

    const desclineOrders = decline
      .map((swapId) => actions.core.getSwapById(swapId))
      .filter((swap) => {
        const {
          isFinished,
          isRefunded,
          isStoppedSwap,
        } = swap.flow.state
        // if timeout - skip this swap. for refund, if need - use history page
        const lifeTimeout = swap.checkTimeout(60 * 60 * 3)
        return isFinished || isRefunded || isStoppedSwap || lifeTimeout
      })

    this.setState({
      desclineOrders,
    })
  }

  getCoinData = (coin) => {
    const {
      currenciesData,
      tokensData,
    } = this.props
    const currencyData = currenciesData.find(
      (item) => item.currency === coin
    )
    const tokenData = tokensData.find(
      (item) => item.currency === coin
    )
    return currencyData || tokenData
  }

  getCoinFullName = (coin) => {
    const coinData = this.getCoinData(coin)
    return (coinData) ? coinData.fullName : coin
  }

  showIncompleteSwap = () => {
    const { desclineOrders } = this.state;
    actions.modals.open(constants.modals.IncompletedSwaps, {
      desclineOrders,
    });
  };

  componentDidMount() {
    const walletsArray = actions.core.getWallets()

    for (let wallet of walletsArray) {
      if (wallet.balance > 0) {
        this.setState({
          balanceOnWalletsIsOk: true
        })
        break
      } 
    }
  }

  render() {
    const {
      activeFiat,
      currencies,
      addSelectedItems,
      currenciesData,
      tokensData,
      intl: { locale, formatMessage },
      isOnlyForm,
      match: { params: { linkedOrderId } },
    } = this.props

    const {
      haveCurrency,
      getCurrency,
      fromAddress,
      toAddress,
      orderId,
      isNonOffers,
      isSearching,
      maxAmount,
      exHaveRate,
      exGetRate,
      maxBuyAmount,
      getAmount,
      goodRate,
      isShowBalance,
      haveAmount,
      isNoAnyOrders,
      isFullLoadingComplite,
      redirectToSwap,
      isWaitForPeerAnswer,
      desclineOrders,
      isDeclinedOffer,
      pairFees,
      balances,
      balanceOnWalletsIsOk,
    } = this.state

    const sellCoin = haveCurrency.toUpperCase()
    const buyCoin = getCurrency.toUpperCase()
    const balance = this.getBalance(sellCoin)

    if (redirectToSwap) {
      const uri = `${localisedUrl(locale, links.swap)}/${getCurrency}-${haveCurrency}/${orderId}`
      return (
        <Redirect
          to={uri}
          push
        />
      )
    }


    let balanceTooltip = null

    if (pairFees
      && pairFees.byCoins
    ) {
      const sellCoinFee = pairFees.byCoins[sellCoin] || false
      balanceTooltip = (
        <p styleName="maxAmount">
          {(
            (BigNumber(balance).toNumber() === 0)
            || (
              sellCoinFee
              && BigNumber(balance).minus(sellCoinFee.fee).isLessThanOrEqualTo(0)
            )
          ) ? ( null ) 
            : (
              <>
                {sellCoinFee
                  ?
                  <FormattedMessage
                    id="Exchange_AvialableBalance"
                    defaultMessage="Доступно: "
                  />
                  :
                  <FormattedMessage
                    id="partial767"
                    defaultMessage="Your balance: "
                  />
                }
                {sellCoinFee && sellCoinFee.fee
                  ? BigNumber(balance)
                    .minus(sellCoinFee.fee)
                    .dp(5, BigNumber.ROUND_FLOOR).toString()
                  : BigNumber(balance)
                    .dp(5, BigNumber.ROUND_FLOOR).toString()
                }
                {'  '}
                {sellCoin}
              </>
            )
          }
        </p>
      )
    }

    const haveFiat = BigNumber(exHaveRate)
      .times(haveAmount)
      .dp(2, BigNumber.ROUND_CEIL)

    const getFiat = BigNumber(exGetRate)
      .times(getAmount)
      .dp(2, BigNumber.ROUND_CEIL)

    const fiatFeeCalculation = (pairFees) ? (
      BigNumber(pairFees.buyExRate).times(pairFees.buy.fee)
      .plus(
        BigNumber(pairFees.sellExRate).times(pairFees.sell.fee)
      )
      .dp(2, BigNumber.ROUND_CEIL)
      .toNumber()
    ) : 0

    const currentCurrency = this.getCoinData(sellCoin)

    const oneCryptoCost = maxBuyAmount.isLessThanOrEqualTo(0)
      ? BigNumber(0)
      : BigNumber(goodRate);

    const linked = Link.all(this, 'haveAmount', 'getAmount')

    const isWidgetLink =
      this.props.location.pathname.includes("/exchange") &&
      this.props.location.hash === "#widget";
    const isWidget = isWidgetBuild || isWidgetLink;

    const availableAmount = (
      pairFees 
      && pairFees.byCoins 
      && pairFees.byCoins[sellCoin]
      && BigNumber(pairFees.byCoins[sellCoin].fee).isGreaterThan(0)
    ) ? BigNumber(haveAmount).minus(
          pairFees.byCoins[sellCoin].fee
        )
      : 0

    const isLowAmount = this.checkoutLowAmount()

    const sellTokenFullName = this.getCoinFullName(sellCoin)
    const buyTokenFullName = this.getCoinFullName(buyCoin)

    const isPrice = oneCryptoCost.isGreaterThan(0) && oneCryptoCost.isFinite() && !isNonOffers

    const isErrorNoOrders = isNoAnyOrders && linked.haveAmount.value > 0 && isFullLoadingComplite

    const isErrorLowLiquidity = !isNoAnyOrders &&
      maxAmount > 0 &&
      isNonOffers &&
      linked.haveAmount.value > 0

    const isErrorLowAmount = this.doesComissionPreventThisOrder() &&
      BigNumber(getAmount).isGreaterThan(0) &&
      haveAmount &&
      getAmount


    // temporarly disable some combinations (need test)
    const isErrorExternalDisabled =
      (fromAddress && ![AddressType.Internal, AddressType.Metamask, AddressType.Custom].includes(fromAddress.type)) ||
      (toAddress && ![AddressType.Internal, AddressType.Metamask, AddressType.Custom].includes(toAddress.type))


    const canStartSwap =
      !isErrorExternalDisabled &&
      !isNonOffers &&
      fromAddress &&
      toAddress && toAddress.value &&
      BigNumber(getAmount).isGreaterThan(0) &&
      !this.doesComissionPreventThisOrder() &&
      (BigNumber(haveAmount).isGreaterThan(balance) ||
        BigNumber(balance).isGreaterThanOrEqualTo(availableAmount)) &&
      !isWaitForPeerAnswer

    const isIncompletedSwaps = !!desclineOrders.length


    const Form = (
      <div styleName="section">
        <div styleName="formExchange">
          <div styleName="userSendAndGet">
            <div className="userSend">
              <div className="data-tut-have_tourDisabled">
                <SelectGroup
                  activeFiat={activeFiat}
                  switchBalanceFunc={this.switchBalance}
                  inputValueLink={linked.haveAmount.pipe(this.setAmount)}
                  selectedValue={haveCurrency}
                  onSelect={this.handleSetHaveValue}
                  label={
                    <FormattedMessage id="partial243" defaultMessage="You sell" />
                  }
                  id="Exchange456"
                  placeholder="0.00000000"
                  fiat={maxAmount > 0 && isNonOffers ? 0 : haveFiat}
                  currencies={currencies}
                  onFocus={() => this.extendedControlsSet(true)}
                  onBlur={() =>
                    setTimeout(() => this.extendedControlsSet(false), 200)
                  }
                  inputToolTip={() => (isShowBalance ?
                    (balanceTooltip)
                    :
                    <span />)
                  }
                />
              </div>

              <AddressSelect
                label={
                  <FormattedMessage id="Exchange_FromAddress" defaultMessage="From address" />
                }
                isDark={isDark}
                currency={haveCurrency}
                role={AddressRole.Send}
                hasError={false}
                onChange={(addrData) => this.applyAddress(AddressRole.Send, addrData)}
              />
            </div>

            <div styleName="switchButton">
              <Switching noneBorder onClick={this.flipCurrency} />
            </div>

            <div className="userGet">
              <div className="data-tut-get_tourDisabled">
                <SelectGroup
                  activeFiat={activeFiat}
                  dataTut="get"
                  switchBalanceFunc={this.switchBalance}
                  inputValueLink={linked.getAmount}
                  selectedValue={getCurrency}
                  onSelect={this.handleSetGetValue}
                  disabled={true} // value calculated from market price
                  label={
                    <FormattedMessage id="partial255" defaultMessage="You get" />
                  }
                  id="Exchange472"
                  currencies={addSelectedItems}
                  fiat={getFiat}
                  error={isLowAmount}
                />
              </div>

              <AddressSelect
                label={
                  <FormattedMessage id="Exchange_ToAddress" defaultMessage="To address" />
                }
                isDark={isDark}
                role={AddressRole.Receive}
                currency={getCurrency}
                hasError={false}
                onChange={(addrData) => this.applyAddress(AddressRole.Receive, addrData)}
              />
            </div>
          </div>


          <div styleName="errors">

            {isErrorNoOrders &&
              <Fragment>
                <p styleName="error">
                  <FormattedMessage
                    id="PartialPriceNoOrdersReduce"
                    defaultMessage="No orders found, try later or change the currency pair"
                  />
                </p>
              </Fragment>
            }

            {isErrorLowLiquidity &&
              <Fragment>
                <p styleName="error">
                  <FormattedMessage
                    id="PartialPriceNoOrdersReduceAllInfo"
                    defaultMessage="This trade amount is too high for present market liquidity. Please reduce amount to {maxForSell}."
                    values={{
                      maxForBuy: `${maxAmount} ${getCurrency.toUpperCase()}`,
                      maxForSell: `${maxBuyAmount.toFixed(8)} ${haveCurrency.toUpperCase()}`
                    }}
                  />
                </p>
              </Fragment>
            }

            {isErrorLowAmount &&
              <p styleName="error">
                <FormattedMessage
                  id="ErrorBtcLowAmount"
                  defaultMessage="This amount is too low"
                  values={{
                    btcAmount:
                      this.state.haveCurrency === "btc"
                        ? this.state.haveAmount
                        : this.state.getAmount,
                  }}
                />
              </p>
            }

            {isDeclinedOffer &&
              <p styleName="error link" onClick={() => this.goDeclimeFaq()}>
                {' '}
                {/* eslint-disable-line */}
                <FormattedMessage
                  id="PartialOfferCantProceed1"
                  defaultMessage="Request rejected, possibly you have not complete another swap {br}{link}"
                  values={{
                    link: (
                      <a
                        className="errorLink"
                        role="button"
                        onClick={() => this.goDeclimeFaq()}
                      >
                        {' '}
                        {/* eslint-disable-line */}
                        <FormattedMessage
                          id="PartialOfferCantProceed1_1"
                          defaultMessage="Check here"
                        />
                      </a>
                    ),
                    br: <br />,
                  }}
                />
              </p>
            }

            {isErrorExternalDisabled &&
              <p styleName="error">The exchange is temporarily disabled for some external addresses (under maintenance)</p>
            }

          </div>


          <div styleName="conditions">
            <div styleName={`price ${isDark ? '--dark' : ''}`}>
              <FormattedMessage
                id="Exchange_BestPrice"
                defaultMessage="Best price:"
              />
              {' '}
              {!isPrice && !isErrorNoOrders &&
                <InlineLoader />
              }
              {isPrice &&
                `1 ${getCurrency.toUpperCase()} = ${oneCryptoCost.toFixed(5)} ${haveCurrency.toUpperCase()}`
              }
              {isErrorNoOrders &&
                '?'
              }
            </div>

            <div styleName="fees">
              <div styleName="serviceFee">
                <span>
                  <FormattedMessage
                    id="Exchange_ServiceFee"
                    defaultMessage="Service fee"
                  />:
                </span>
                &nbsp;
                <span>0</span>
              </div>

              <div styleName="minerFee">
                <span>
                  <FormattedMessage
                    id="Exchange_MinerFees"
                    defaultMessage="Miner fee"
                  />:
                </span>
                &nbsp;
                {!(pairFees) ?
                  <span><InlineLoader /></span>
                  :
                  <span>
                    {pairFees.buy.fee} {pairFees.buy.coin} + {pairFees.sell.fee} {pairFees.sell.coin}
                    {fiatFeeCalculation > 0 &&
                      <span> &asymp; ${fiatFeeCalculation} </span>
                    }
                    <a href="https://wiki.swaponline.io/faq/why-i-pay-ming-fees-of-btc-and-eth-both-why-not-seller/" target="_blank">(?)</a>
                  </span>
                }
              </div>
            </div>
          </div>


          {isWaitForPeerAnswer &&
            <div styleName="swapStartStatus">
              <div styleName="swapStartStatusLoader">
                <InlineLoader />
              </div>
              <FormattedMessage
                id="partial291"
                defaultMessage="Waiting for another participant (30 sec)"
              />
            </div>
          }

          
          <div styleName="buttons">
            {/* Exchange */}
            <Button
              className="data-tut-Exchange_tourDisabled"
              styleName="button"
              blue
              onClick={this.initSwap}
              disabled={!canStartSwap}
            >
              <FormattedMessage id="partial541" defaultMessage="Exchange now" />
            </Button>
            {/* Creates offer */}
            <>
              <Button
                id="createOrderReactTooltipMessageForUser"
                styleName={`button link-like ${balanceOnWalletsIsOk ? '' : 'noMany'}`}
                onClick={balanceOnWalletsIsOk ? this.createOffer : null}
              >
                <FormattedMessage id="orders128" defaultMessage="Create offer" />
              </Button>
              {balanceOnWalletsIsOk
                ? (
                  <ReactTooltip id="createOrderReactTooltipMessageForUser" effect="solid" type="dark" place="bottom">
                    <FormattedMessage
                      id="createOrderMessageForUser"
                      defaultMessage="You must be online all the time, otherwise your order will not be visible to other users"
                    />
                  </ReactTooltip>
                )
                : (
                  <ReactTooltip id="createOrderReactTooltipMessageForUser" effect="solid" type="dark" place="bottom">
                    <FormattedMessage
                      id="createOrderNoManyMessageForUser"
                      defaultMessage="Top up your balance"
                    />
                  </ReactTooltip>
                )
              }
            </>

            {isIncompletedSwaps &&
              <Button blue styleName="buttonContinueSwap" onClick={this.showIncompleteSwap}>
                <FormattedMessage
                  id="continueDeclined977"
                  defaultMessage="Continue your swaps"
                />
              </Button>
            }
          </div>


          <div styleName="networkStatusPlace">
            <NetworkStatus />
          </div>

          {!isWidgetBuild &&
            <a
              href="https://generator.swaponline.site/generator/"
              target="_blank"
              rel="noopener noreferrer"
              styleName="widgetLink"
            >
              <FormattedMessage
                id="partial1021"
                defaultMessage="Embed on website"
              />
            </a>
          }
        </div>
      </div>
    );

    return (
      <div styleName="exchangeWrap">
        <div
          styleName={`promoContainer ${isDark ? '--dark' : ''}`}
          ref={(ref) => (this.promoContainer = ref)}
        >
          {config && config.showHowItsWork && (
            <div
              styleName="scrollToTutorialSection"
              ref={(ref) => (this.scrollTrigger = ref)}
              onClick={() =>
                animate((timePassed) => {
                  window.scrollTo(
                    0,
                    this.promoContainer.clientHeight * (timePassed / 100)
                  );
                }, 100)
              }
            >
              <span styleName="scrollAdvice">
                <FormattedMessage
                  id="PartialHowItWorks10"
                  defaultMessage="How it works?"
                />
              </span>
              <span styleName="scrollTrigger" />
            </div>
          )}
          <Fragment>
            <div styleName="container">
              <Promo
                subTitle={subTitle(
                  sellTokenFullName,
                  haveCurrency.toUpperCase(),
                  buyTokenFullName,
                  getCurrency.toUpperCase()
                )}
              />
              {Form}
              <Orders
                sell={haveCurrency}
                buy={getCurrency}
                linkedOrderId={linkedOrderId}
                pairFees={pairFees}
                balances={balances}
                checkSwapAllow={this.checkSwapAllow}
              />
            </div>
          </Fragment>
        </div>
        {config && config.showHowItsWork && (
          <Fragment>
            <HowItWorks />
            <VideoAndFeatures />
            <Quote />
          </Fragment>
        )}
      </div>
    );
  }
}
