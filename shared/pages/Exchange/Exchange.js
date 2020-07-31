import React, { Component, Fragment } from "react";

import Link from "sw-valuelink";

import CSSModules from "react-css-modules";
import styles from "./Exchange.scss";

import { connect } from "redaction";
import actions from "redux/actions";
import { BigNumber } from "bignumber.js";
import { Redirect } from "react-router-dom";
import { getState } from "redux/core";
import reducers from "redux/core/reducers";
import { isMobile } from 'react-device-detect'

import SelectGroup from "./SelectGroup/SelectGroup";
import { Button } from "components/controls";
import Promo from "./Promo/Promo";
import Quote from "./Quote";
import HowItWorks from "./HowItWorks/HowItWorks";
import VideoAndFeatures from "./VideoAndFeatures/VideoAndFeatures";
import Tooltip from "components/ui/Tooltip/Tooltip";
import InlineLoader from "components/loaders/InlineLoader/InlineLoader";
import { FormattedMessage, injectIntl } from "react-intl";
import { localisedUrl } from "helpers/locale";
import config from "helpers/externalConfig";
import SwapApp, { util } from "swap.app";
import QrReader from "components/QrReader";

import helpers, { constants, links } from "helpers";
import { animate } from "helpers/domUtils";
import Switching from "components/controls/Switching/Switching";
import CustomDestAddress from "./CustomDestAddress/CustomDestAddress";
import Orders from "../Home/Home"

const allowedCoins = [
  ...(!config.opts.curEnabled || config.opts.curEnabled.btc ? ["BTC"] : []),
  ...(!config.opts.curEnabled || config.opts.curEnabled.eth ? ["ETH"] : []),
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
      <Tooltip id="partialAtomicSwapWhatIsIt1" dontHideMobile>
        <FormattedMessage
          id="partialAtomicSwapWhatIsIt"
          defaultMessage="Atomic swap is a smart contract technology that enables exchange."
        />
      </Tooltip>
    </span>
  </div>
);

const isWidgetBuild = config && config.isWidget;
const bannedPeers = {}; // Пиры, которые отклонили запрос на свап, они будут понижены в выдаче

@injectIntl
@connect(
  ({
    currencies,
    addSelectedItems,
    rememberedOrders,
    addPartialItems,
    history: { swapHistory },
    core: { orders, hiddenCoinsList },
    user: { ethData, btcData, tokensData, activeFiat, ...rest },
  }) => ({
    currencies: isExchangeAllowed(currencies.partialItems),
    allCurrencyies: currencies.items,
    addSelectedItems: isExchangeAllowed(currencies.addPartialItems),
    orders: filterIsPartial(orders),
    allOrders: orders,
    currenciesData: [ethData, btcData],
    tokensData: [...Object.keys(tokensData).map((k) => tokensData[k])],
    decline: rememberedOrders.savedOrders,
    hiddenCoinsList,
    userEthAddress: ethData.address,
    swapHistory,
    activeFiat,
    usersData: [
      ethData,
      btcData,
      ...Object.values(tokensData).filter(({ address }) => address),
      ...Object.values(rest).filter(({ address }) => address)
    ],
  })
)
@CSSModules(styles, { allowMultiple: true })
export default class Exchange extends Component {
  static defaultProps = {
    orders: [],
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
    const bannedPeersTimeout = 180; // В секундах - три минуты
    bannedPeers[peerID] =
      Math.floor(new Date().getTime() / 1000) + bannedPeersTimeout;
  }

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
        history.push(localisedUrl(locale, `${links.exchange}/usdt-to-btc`));
      }
    }
    const sellToken = sell || "btc";
    const buyToken = buy || (!isWidgetBuild ? "usdt" : config.erc20token);

    this.returnNeedCurrency(sellToken, buyToken);

    if (
      !(buy && sell) &&
      !props.location.hash.includes("#widget") &&
      !isRootPage
    ) {
      if (url !== "/wallet") {
        history.push(
          localisedUrl(locale, `${links.exchange}/${sellToken}-to-${buyToken}`)
        );
      }
    }

    this.wallets = {};
    currenciesData.forEach((item) => {
      this.wallets[item.currency] = item.address;
    });
    tokensData.forEach((item) => {
      this.wallets[item.currency] = item.address;
    });

    this.state = {
      isToken: false,
      dynamicFee: 0,
      haveCurrency: sellToken,
      getCurrency: buyToken,
      haveAmount: 0,
      haveFiat: 0,
      getFiat: 0,
      getAmount: "",
      isShowBalance: true,
      isLowAmount: false,
      maxAmount: 0,
      maxBuyAmount: new BigNumber(0),
      peer: "",
      goodRate: 0,
      filteredOrders: [],
      isNonOffers: false,
      isFetching: false,
      isDeclinedOffer: false,
      customWalletUse: true,
      customWallet: this.wallets[buyToken.toUpperCase()],
      extendedControls: false,
      estimatedFeeValues: {},
      desclineOrders: [],
      openScanCam: false,
      destinationSelected: false,
    };

    constants.coinsWithDynamicFee.forEach(
      (item) =>
        (this.state.estimatedFeeValues[item] = constants.minAmountOffer[item])
    );

    this.cacheDynamicFee = {};

    if (config.isWidget) {
      this.state.getCurrency = config.erc20token;
    }
  }

  componentDidMount() {
    const { haveCurrency, getCurrency, estimatedFeeValues } = this.state;
    actions.core.updateCore();
    this.returnNeedCurrency(haveCurrency, getCurrency);
    this.checkPair();
    this.updateAllowedBalance();

    this.getFiatBalance();

    this.timer = true;
    const timerProcess = () => {
      if (!this.timer) return;
      this.setOrders();
      this.showTheFee(haveCurrency);
      this.checkUrl();
      this.getCorrectDecline();
      setTimeout(timerProcess, 2000);
    };
    timerProcess();

    SwapApp.shared().services.room.on("new orders", () => this.checkPair());
    this.customWalletAllowed();
    this.setEstimatedFeeValues(estimatedFeeValues);

    document.addEventListener("scroll", this.rmScrollAdvice);

    setTimeout(() => {
      this.setState(() => ({ isFullLoadingComplite: true }))
    }, 60 * 1000)
  }

  rmScrollAdvice = () => {
    if (window.scrollY > window.innerHeight * 0.7 && this.scrollTrigger) {
      this.scrollTrigger.classList.add("hidden");
      document.removeEventListener("scroll", this.rmScrollAdvice);
    }
  };

  setEstimatedFeeValues = async (estimatedFeeValues) => {
    const fee = await helpers.estimateFeeValue.setEstimatedFeeValues({
      estimatedFeeValues,
    });

    return this.setState({
      estimatedFeeValues: fee,
    });
  };

  componentWillUnmount() {
    this.timer = false;
  }

  checkUrl = () => {
    const {
      match: { params },
    } = this.props;
    const { getCurrency, haveCurrency } = this.state;

    const buyValue = params.buy;
    const sellValue = params.sell;

    if (haveCurrency && params.sell !== haveCurrency) {
      if (sellValue) {
        this.handleSetHaveValue({ value: sellValue });
      }
    }

    if (getCurrency && params.buy !== getCurrency) {
      if (buyValue) {
        this.checkValidUrl(sellValue, buyValue);
      }
    }
  };

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

  additionalPathing = (sell, buy) => {
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

  showTheFee = async () => {
    const { haveCurrency } = this.state;
    if (this.cacheDynamicFee[haveCurrency]) {
      this.setState({
        isToken: this.cacheDynamicFee[haveCurrency].isToken,
        dynamicFee: this.cacheDynamicFee[haveCurrency].dynamicFee,
      });
    } else {
      const isToken = await helpers.ethToken.isEthToken({
        name: haveCurrency.toLowerCase(),
      });

      if (isToken) {
        this.cacheDynamicFee[haveCurrency] = {
          isToken,
          dynamicFee: 0,
        };
        this.setState(() => ({
          isToken,
        }));
      } else {
        const dynamicFee = await helpers[
          haveCurrency.toLowerCase()
        ].estimateFeeValue({ method: "swap" });
        this.cacheDynamicFee[haveCurrency] = {
          isToken,
          dynamicFee,
        };
        this.setState(() => ({
          dynamicFee,
          isToken,
        }));
      }
    }
  };

  getFiatBalance = async () => {
    const { activeFiat } = this.props;
    const { haveCurrency, getCurrency } = this.state;

    try {
      const exHaveRate = (this.fiatRates[
        haveCurrency
      ] = await actions.user.getExchangeRate(
        haveCurrency,
        activeFiat.toLowerCase()
      ));

      const exGetRate = (this.fiatRates[
        getCurrency
      ] = await actions.user.getExchangeRate(
        getCurrency,
        activeFiat.toLowerCase()
      ));

      this.fiatRates[haveCurrency] = exHaveRate;
      this.fiatRates[getCurrency] = exGetRate;

      this.setState(() => ({
        exHaveRate,
        exGetRate,
      }));
    } catch (e) {
      const exHaveRate =
        this.fiatRates && this.fiatRates[haveCurrency] !== undefined
          ? this.fiatRates[haveCurrency]
          : 0;
      const exGetRate =
        this.fiatRates && this.fiatRates[getCurrency] !== undefined
          ? this.fiatRates[getCurrency]
          : 0;
      this.setState(() => ({
        exHaveRate,
        exGetRate,
      }));
      console.warn("Cryptonator offline", e);
    }
  };

  handleGoTrade = async () => {
    const { decline, usersData } = this.props;
    const { haveCurrency, destinationSelected, haveAmount } = this.state;

    const haveCur = haveCurrency.toUpperCase()
    const { balance, address } = usersData.find(({ currency }) => currency === haveCur)


    if (haveCur.toUpperCase() !== "BTC" && balance < haveAmount) {
      const hiddenCoinsList = await actions.core.getHiddenCoins()
      const isDidntActivateWallet = hiddenCoinsList.find(el => haveCur.toUpperCase() === el.toUpperCase())

      actions.modals.open(constants.modals.AlertWindow, {
        title: !isDidntActivateWallet ?
          <FormattedMessage
            id="AlertOrderNonEnoughtBalanceTitle"
            defaultMessage="Not enough balance."
          /> :
          <FormattedMessage
            id="walletDidntCreateTitle"
            defaultMessage="Wallet does not exist."
          />,
        currency: haveCur,
        address,
        actionType: !isDidntActivateWallet ? "deposit" : "createWallet",
        message: !isDidntActivateWallet ?
          <FormattedMessage
            id="AlertOrderNonEnoughtBalance"
            defaultMessage="Please top up your balance before you start the swap."
          /> :
          <FormattedMessage
            id="walletDidntCreateMessage"
            defaultMessage="Create {curr} wallet before you start the swap."
            values={{
              curr: haveCur
            }}
          />
      })
      return
    }

    if (!destinationSelected) {
      this.setState({
        destinationError: true,
      });
      return;
    }

    if (decline.length === 0) {
      this.sendRequest();
    } else {
      const getDeclinedExistedSwapIndex = helpers.handleGoTrade.getDeclinedExistedSwapIndex(
        {
          currency: haveCurrency,
          decline,
        }
      );
      if (getDeclinedExistedSwapIndex !== false) {
        this.handleDeclineOrdersModalOpen(getDeclinedExistedSwapIndex);
      } else {
        this.sendRequest();
      }
    }
  };

  createOffer = async () => {
    const { haveCurrency, getCurrency } = this.state

    actions.modals.open(constants.modals.Offer, {
      sellCurrency: haveCurrency,
      buyCurrency: getCurrency,
    })
    // actions.analytics.dataEvent('orderbook-click-createoffer-button')
  };

  handleDeclineOrdersModalOpen = (indexOfDecline) => {
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

  sendRequest = () => {
    const {
      getAmount,
      haveAmount,
      peer,
      orderId,
      customWallet,
      maxAmount,
      maxBuyAmount,
    } = this.state;

    if (!String(getAmount) || !peer || !orderId || !String(haveAmount)) {
      return;
    }

    const newValues = {
      sellAmount: maxBuyAmount.isEqualTo(haveAmount) ? maxAmount : getAmount,
    };

    const destination = {
      address: this.customWalletAllowed() ? customWallet : null,
    };

    this.setState(() => ({ isFetching: true }));

    const requestTimeoutLenght = config && config.isWidgetBuild ? 60 : 30;

    const requestTimeout = setTimeout(() => {
      this.banPeer(peer);
      this.getLinkTodeclineSwap(peer);
      this.setDeclinedOffer();
    }, requestTimeoutLenght * 1000); // 45 seconds wait until not skip and ban peer

    this.onRequestAnswer = (newOrder, isAccepted) => {
      clearTimeout(requestTimeout);
      if (isAccepted) {
        this.setState(() => ({
          redirect: true,
          isFetching: false,
          orderId: newOrder.id,
        }));
      } else {
        this.banPeer(peer);
        this.getLinkTodeclineSwap(peer);
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

  getLinkTodeclineSwap = () => {
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

  returnNeedCurrency = (sellToken, buyToken) => {
    const partialItems = Object.assign(getState().currencies.partialItems); // eslint-disable-line

    const partialCurrency = getState().currencies.partialItems.map(
      (item) => item.name
    );
    const allCurrencyies = getState().currencies.items.map((item) => item.name);
    let partialItemsArray = [...partialItems];
    let currenciesOfUrl = [];
    currenciesOfUrl.push(sellToken, buyToken);

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
          haveCurrency: config && config.isWidget ? config.erc20token : "swap",
        }));
      }
    });
  };

  setDeclinedOffer = () => {
    this.setState(() => ({
      haveAmount: "",
      isFetching: false,
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

    // Если не нашли предложечение, проверим забаненые пиры
    if (!isFound) {
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

  handleCustomWalletUse = () => {
    const { customWalletUse } = this.state;

    const newCustomWalletUse = !customWalletUse;

    this.setState({
      customWalletUse: newCustomWalletUse,
      customWallet: newCustomWalletUse === false ? "" : this.getSystemWallet(),
    });
  };

  handleSetGetValue = ({ value }) => {
    const { haveCurrency, getCurrency, customWalletUse } = this.state;

    if (value === haveCurrency) {
      this.handleFlipCurrency();
    } else {
      this.setState(() => ({
        getCurrency: value,
        haveCurrency,
        customWallet: customWalletUse ? this.getSystemWallet() : "",
      }));
      this.additionalPathing(haveCurrency, value);
      actions.analytics.dataEvent({
        action: "exchange-click-selector",
        label: `${haveCurrency}-to-${getCurrency}`,
      });
    }
  };

  handleSetHaveValue = async ({ value }) => {
    const { haveCurrency, getCurrency, customWalletUse } = this.state;

    if (value === getCurrency) {
      this.handleFlipCurrency();
    } else {
      this.setState(
        {
          haveCurrency: value,
          getCurrency,
          customWallet: customWalletUse ? this.getSystemWallet() : "",
        },
        () => {
          this.additionalPathing(value, getCurrency);
          actions.analytics.dataEvent({
            action: "exchange-click-selector",
            label: `${haveCurrency}-to-${getCurrency}`,
          });

          this.checkPair();
          this.updateAllowedBalance();
        }
      );
    }
  };

  handleGoDeclimeFaq = () => {
    const faqLink = links.getFaqLink("requestDeclimed");
    if (faqLink) {
      window.location.href = faqLink;
    }
  };

  handleFlipCurrency = async () => {
    const { haveCurrency, getCurrency, customWalletUse } = this.state;

    this.setClearState();
    this.additionalPathing(getCurrency, haveCurrency);
    this.setState(
      {
        haveCurrency: getCurrency,
        getCurrency: haveCurrency,
        customWallet: customWalletUse ? this.getSystemWallet(haveCurrency) : "",
      },
      () => {
        actions.analytics.dataEvent({
          action: "exchange-click-selector",
          label: `${haveCurrency}-to-${getCurrency}`,
        });
        this.checkPair();
        this.updateAllowedBalance();
      }
    );
  };

  handlePush = (isWidget = false) => {
    const {
      intl: { locale },
    } = this.props;
    const { haveCurrency, getCurrency } = this.state;

    const currency = haveCurrency.toLowerCase();

    const pair = constants.tradeTicker
      .filter((ticker) => {
        ticker = ticker.split("-");
        return currency === ticker[0].toLowerCase()
          ? ticker[0].toLowerCase() === currency
          : ticker[1].toLowerCase() === currency;
      })
      .map((pair) => {
        pair = pair.split("-");
        return {
          from: pair[0],
          to: pair[1],
        };
      });

    const sendLinkFrom = pair.filter(
      (item) =>
        item.from === haveCurrency.toUpperCase() ||
        item.from === getCurrency.toUpperCase()
    );
    const sendLinkTo = pair.filter(
      (item) =>
        item.to === haveCurrency.toUpperCase() ||
        item.to === getCurrency.toUpperCase()
    );

    const tradeTicker = `${sendLinkFrom[0].from.toLowerCase()}-${sendLinkTo[0].to.toLowerCase()}`;

    const hostname = window.location.origin;
    const pathname = constants.tradeTicker.includes(tradeTicker.toUpperCase())
      ? tradeTicker
      : tradeTicker.split("-").reverse().join("-");

    if (isWidget) {
      window.parent.location.replace(`${hostname}/${pathname}`);
    } else {
      this.props.history.push(localisedUrl(locale, `/${tradeTicker}`));
    }
  };

  setClearState = () => {
    const { getCurrency, customWalletUse } = this.state;

    this.setState(() => ({
      haveAmount: 0,
      haveHeat: 0,
      getHeat: 0,
      getAmount: "",
      maxAmount: 0,
      maxBuyAmount: BigNumber(0),
      peer: "",
      isNonOffers: false,
      isFetching: false,
      isDeclinedOffer: false,
      customWallet: customWalletUse
        ? this.wallets[getCurrency.toUpperCase()]
        : "",
    }));
  };

  getSystemWallet = (walletCurrency) => {
    const { getCurrency } = this.state;

    return this.wallets[
      walletCurrency ? walletCurrency.toUpperCase() : getCurrency.toUpperCase()
    ];
  };

  customWalletValid() {
    const { haveCurrency, getCurrency, customWallet } = this.state;

    if (!this.customWalletAllowed()) return true;

    if (getCurrency === "btc")
      return util.typeforce.isCoinAddress.BTC(customWallet);

    return util.typeforce.isCoinAddress.ETH(customWallet);
  }

  customWalletAllowed() {
    const { haveCurrency, getCurrency } = this.state;

    if (haveCurrency === "btc") {
      // btc-token
      if (config.erc20[getCurrency] !== undefined) return true;
      // btc-eth
      if (getCurrency === "eth") return true;
    }
    if (config.erc20[haveCurrency] !== undefined) {
      // token-btc
      if (getCurrency === "btc") return true;
    }

    if (haveCurrency === "eth") {
      // eth-btc
      if (getCurrency === "btc") return true;
    }

    return false;
  }

  checkPair = () => {
    const { getCurrency, haveCurrency } = this.state;

    const noPairToken = config && config.isWidget ? config.erc20token : "swap";

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

  updateAllowedBalance = async () => {
    await actions[this.state.haveCurrency].getBalance(this.state.haveCurrency);
  };

  checkoutLowAmount() {
    return (
      this.doesComissionPreventThisOrder() &&
      BigNumber(this.state.getAmount).isGreaterThan(0) &&
      this.state.haveAmount &&
      this.state.getAmount
    );
  }

  changeBalance = (value) => {
    this.extendedControlsSet(false);
    this.setState({
      haveAmount: value,
    });
  };

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
      haveAmount,
      getAmount,
      haveCurrency,
      getCurrency,
      estimatedFeeValues,
    } = this.state;
    const isBtcHere = haveCurrency === "btc" || getCurrency === "btc";

    if (!isBtcHere) {
      return false;
    }
    const btcAmount = BigNumber(
      haveCurrency === "btc" ? haveAmount : getAmount
    );
    if (btcAmount.isGreaterThan(estimatedFeeValues.btc)) {
      return false;
    }
    return true;
  };

  addressIsCorrect() {
    const { customWallet, getCurrency } = this.state;

    return util.typeforce.isCoinAddress[getCurrency.toUpperCase()](
      customWallet
    );
  }

  getCorrectDecline = () => {
    const { decline, swapHistory } = this.props;

    const localSavedOrdersString = localStorage.getItem("savedOrders");

    if (!localSavedOrdersString) return;
    const localSavedOrders = JSON.parse(localSavedOrdersString);

    if (localSavedOrders.length !== decline.length) {
      return;
    }

    const desclineOrders = decline
      .map((swapId) => actions.core.getSwapById(swapId))
      .filter((el) => {
        const { isFinished, isRefunded, isStoppedSwap } = el.flow.state;
        // if timeout - skip this swap. for refund, if need - use history page
        const lifeTimeout = el.checkTimeout(60 * 60 * 3);
        return isFinished || isRefunded || isStoppedSwap || lifeTimeout;
      });

    this.setState(() => ({ desclineOrders }));
  };

  handleShowIncomplete = () => {
    const { desclineOrders } = this.state;
    actions.modals.open(constants.modals.IncompletedSwaps, {
      desclineOrders,
    });
  };

  openScan = () => {
    const { openScanCam } = this.state;

    this.setState(() => ({
      openScanCam: !openScanCam,
    }));
  };

  handleError = (err) => {
    console.error(err);
  };

  onCustomWalletChange = (state) => {
    const { selected, isCustom, value } = state;

    this.setState({
      destinationSelected: selected,
      destinationError: false,
      customWalletUse: !isCustom,
      customWallet: isCustom ? value : this.getSystemWallet(),
    });
  };

  handleScan = (data) => {
    if (data) {
      this.setState(() => ({
        customWallet: data.includes(":") ? data.split(":")[1] : data,
      }));
      this.openScan();
    }
  };

  render() {
    const {
      activeFiat,
      currencies,
      addSelectedItems,
      currenciesData,
      tokensData,
      intl: { locale, formatMessage },
      isOnlyForm,
    } = this.props;

    const {
      haveCurrency,
      getCurrency,
      isNonOffers,
      redirect,
      orderId,
      isSearching,
      desclineOrders,
      openScanCam,
      isDeclinedOffer,
      isFetching,
      maxAmount,
      exHaveRate,
      exGetRate,
      maxBuyAmount,
      getAmount,
      goodRate,
      isShowBalance,
      estimatedFeeValues,
      haveAmount,
      customWallet,
      destinationError,
      isNoAnyOrders,
      isFullLoadingComplite
    } = this.state;

    const haveFiat = BigNumber(exHaveRate)
      .times(haveAmount)
      .dp(2, BigNumber.ROUND_CEIL);
    const getFiat = BigNumber(exGetRate)
      .times(getAmount)
      .dp(2, BigNumber.ROUND_CEIL);

    const haveCurrencyData = currenciesData.find(
      (item) => item.currency === haveCurrency.toUpperCase()
    );
    const haveTokenData = tokensData.find(
      (item) => item.currency === haveCurrency.toUpperCase()
    );
    const currentCurrency = haveCurrencyData || haveTokenData;

    const balance = currentCurrency.balance || 0;

    const oneCryptoCost = maxBuyAmount.isLessThanOrEqualTo(0)
      ? BigNumber(0)
      : BigNumber(goodRate);
    const linked = Link.all(this, "haveAmount", "getAmount", "customWallet");

    const isWidgetLink =
      this.props.location.pathname.includes("/exchange") &&
      this.props.location.hash === "#widget";
    const isWidget = isWidgetBuild || isWidgetLink;
    const availableAmount =
      estimatedFeeValues[haveCurrency.toLowerCase()] > 0
        ? BigNumber(haveAmount).plus(
          estimatedFeeValues[haveCurrency.toLowerCase()]
        )
        : 0;

    if (redirect) {
      return (
        <Redirect
          push
          to={`${localisedUrl(
            locale,
            links.swap
          )}/${getCurrency}-${haveCurrency}/${orderId}`}
        />
      );
    }

    const isLowAmount = this.checkoutLowAmount();

    const canDoOrder =
      !isNonOffers &&
      BigNumber(getAmount).isGreaterThan(0) &&
      this.customWalletValid() &&
      !this.doesComissionPreventThisOrder() &&
      (BigNumber(haveAmount).isGreaterThan(balance) ||
        BigNumber(balance).isGreaterThanOrEqualTo(availableAmount));

    const sellTokenFullName = currenciesData.find(
      (item) => item.currency === haveCurrency.toUpperCase()
    )
      ? currenciesData.find(
        (item) => item.currency === haveCurrency.toUpperCase()
      ).fullName
      : haveCurrency.toUpperCase();
    const buyTokenFullName = currenciesData.find(
      (item) => item.currency === getCurrency.toUpperCase()
    )
      ? currenciesData.find(
        (item) => item.currency === getCurrency.toUpperCase()
      ).fullName
      : getCurrency.toUpperCase();

    const Form = (
      <div styleName="section">
        <div styleName="formExchange">
          {desclineOrders.length ? (
            <h5
              role="presentation"
              styleName="informAbt"
              onClick={this.handleShowIncomplete}
            >
              <FormattedMessage
                id="continueDeclined977"
                defaultMessage="Click here to continue your swaps"
              />
            </h5>
          ) : (
              <span />
            )}
          <div className="data-tut-have" styleName="selectWrap">
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
              tooltip={
                <FormattedMessage
                  id="partial462"
                  defaultMessage="The amount you have on swap.online or an external wallet that you want to exchange"
                />
              }
              balanceTooltip={(estimatedFeeValues[haveCurrency])
                ? () => {
                  return (
                    <FormattedMessage
                      id="Exchange_BalanceTooltipInfo"
                      defaultMessage="Ваш баланс {balance} {currency} минус коммисия майнера {minerFee} {currency}"
                      values={{
                        balance,
                        minerFee: estimatedFeeValues[haveCurrency],
                        currency: haveCurrency.toUpperCase(),
                      }}
                    />
                  )
                } : false
              }
              placeholder="0.00000000"
              fiat={maxAmount > 0 && isNonOffers ? 0 : haveFiat}
              currencies={currencies}
              onFocus={() => this.extendedControlsSet(true)}
              onBlur={() =>
                setTimeout(() => this.extendedControlsSet(false), 200)
              }
              inputToolTip={() => isShowBalance ?
                <p styleName="maxAmount">
                  {(
                    (BigNumber(balance).toNumber() === 0)
                    || BigNumber(balance).minus(estimatedFeeValues[haveCurrency]).isLessThanOrEqualTo(0)
                  ) ? (
                      <FormattedMessage
                        id="partial766"
                        defaultMessage="From any wallet or exchange"
                      />
                    ) : (
                      <>
                        {(estimatedFeeValues[haveCurrency])
                          ? (
                            <FormattedMessage
                              id="Exchange_AvialableBalance"
                              defaultMessage="Доступно: "
                            />
                          ) : (
                            <FormattedMessage
                              id="partial767"
                              defaultMessage="Your balance: "
                            />
                          )
                        }
                        {(estimatedFeeValues[haveCurrency])
                          ? BigNumber(balance)
                            .minus(estimatedFeeValues[haveCurrency])
                            .dp(5, BigNumber.ROUND_FLOOR).toString()
                          : BigNumber(balance)
                            .dp(5, BigNumber.ROUND_FLOOR).toString()
                        }
                        {"  "}
                        {haveCurrency.toUpperCase()}
                      </>
                    )}
                </p>
                : <span />
              }
            />
          </div>

          <div styleName="switchButton">
            <Switching noneBorder onClick={this.handleFlipCurrency} />
          </div>
          <div
            className="data-tut-get"
            styleName="selectWrap"
            style={{ marginBottom: "-25px" }}
          >
            <SelectGroup
              activeFiat={activeFiat}
              dataTut="get"
              switchBalanceFunc={this.switchBalance}
              inputValueLink={linked.getAmount}
              selectedValue={getCurrency}
              onSelect={this.handleSetGetValue}
              label={
                <FormattedMessage id="partial255" defaultMessage="You get" />
              }
              id="Exchange472"
              tooltip={
                <FormattedMessage
                  id="partial478"
                  defaultMessage="The amount you will receive after the exchange"
                />
              }
              currencies={addSelectedItems}
              fiat={getFiat}
              error={isLowAmount}
            />
            {oneCryptoCost.isGreaterThan(0) &&
              oneCryptoCost.isFinite() &&
              !isNonOffers && (
                <div styleName="price">
                  <FormattedMessage
                    id="PartialPriceSearch502"
                    defaultMessage="1 {getCurrency} = {haveCurrency}"
                    values={{
                      getCurrency: `${getCurrency.toUpperCase()}`,
                      haveCurrency: `${oneCryptoCost.toFixed(
                        5
                      )} ${haveCurrency.toUpperCase()}`,
                    }}
                  />
                </div>
              )}
          </div>
          <div className="data-tut-status">
            {(isSearching || (isNonOffers && maxAmount === 0)) && (
              <span styleName="IsSearching">
                <FormattedMessage
                  id="PartialPriceSearch"
                  defaultMessage="Searching orders..."
                />
                <div styleName="loaderHolder">
                  <div styleName="additionalLoaderHolder">
                    <InlineLoader />
                  </div>
                </div>
              </span>
            )}
          </div>
          {!oneCryptoCost.isFinite() && !isNonOffers && (
            <FormattedMessage
              id="PartialPriceCalc"
              defaultMessage="Calc price"
            />
          )}
          {isNoAnyOrders && linked.haveAmount.value > 0 && isFullLoadingComplite && <Fragment>
            <p styleName="error">
              <FormattedMessage
                id="PartialPriceNoOrdersReduce"
                defaultMessage="No orders found, try later or change the currency pair"
              />
            </p>
          </Fragment>}
          {!isNoAnyOrders && maxAmount > 0 && isNonOffers && linked.haveAmount.value > 0 && (
            <Fragment>
              <p styleName="error">
                <FormattedMessage
                  id="PartialPriceNoOrdersReduceAllInfo"
                  defaultMessage="This trade amount is too high for present market liquidity. Please reduce amount to {maxForSell}. "
                  values={{
                    maxForBuy: `${maxAmount} ${getCurrency.toUpperCase()}`,
                    maxForSell: `${maxBuyAmount} ${haveCurrency.toUpperCase()}`
                  }}
                />
              </p>
            </Fragment>
          )}
          {isDeclinedOffer && (
            <p styleName="error link" onClick={() => this.handleGoDeclimeFaq()}>
              {" "}
              {/* eslint-disable-line */}
              <FormattedMessage
                id="PartialOfferCantProceed1"
                defaultMessage="Request rejected, possibly you have not complete another swap {br}{link}"
                values={{
                  link: (
                    <a
                      className="errorLink"
                      role="button"
                      onClick={() => this.handleGoDeclimeFaq()}
                    >
                      {" "}
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
          )}
          {this.doesComissionPreventThisOrder() &&
            BigNumber(getAmount).isGreaterThan(0) &&
            this.state.haveAmount &&
            this.state.getAmount && (
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
            )}
          {BigNumber(estimatedFeeValues[haveCurrency]).isGreaterThan(0) &&
            BigNumber(haveAmount).isGreaterThan(0) &&
            BigNumber(haveAmount).isLessThanOrEqualTo(balance) && (
              <div styleName="notifyThat">
                <div>
                  <FormattedMessage
                    id="PartialFeeValueWarn"
                    defaultMessage="The maximum amount you can sell is {maximumAmount} {haveCurrency}. Miner fee up to {estimatedFeeValue} {haveCurrency}"
                    values={{
                      haveCurrency: haveCurrency.toUpperCase(),
                      estimatedFeeValue: estimatedFeeValues[haveCurrency],
                      maximumAmount: BigNumber(balance)
                        .minus(estimatedFeeValues[haveCurrency])
                        .minus(0.000006)
                        .toString(),
                    }}
                  />
                  {BigNumber(estimatedFeeValues[getCurrency]).isGreaterThan(
                    0
                  ) && BigNumber(getAmount).isGreaterThan(0) ? (
                      <Fragment>
                        {` `}
                        <FormattedMessage
                          id="PartialFeeValueWarn1"
                          defaultMessage="+ {estimatedFeeValueGet} {getCurrency}"
                          values={{
                            getCurrency: getCurrency.toUpperCase(),
                            estimatedFeeValue: estimatedFeeValues[getCurrency],
                          }}
                        />
                        {` `}
                        <FormattedMessage
                          id="PartialFeeValueWarn3"
                          defaultMessage="= {estimatedFeeValue}$"
                          values={{
                            estimatedFeeValue: BigNumber(exHaveRate)
                              .times(estimatedFeeValues[haveCurrency])
                              .plus(
                                BigNumber(exGetRate).times(
                                  estimatedFeeValues[getCurrency]
                                )
                              )
                              .dp(2, BigNumber.ROUND_CEIL)
                              .toString(),
                          }}
                        />
                      </Fragment>
                    ) : (
                      <Fragment>
                        {` `}
                        <FormattedMessage
                          id="PartialFeeValueWarn2"
                          defaultMessage="~ {estimatedFeeValue}$"
                          values={{
                            estimatedFeeValue: BigNumber(exHaveRate)
                              .times(estimatedFeeValues[haveCurrency])
                              .dp(2, BigNumber.ROUND_CEIL)
                              .toString(),
                          }}
                        />
                      </Fragment>
                    )}
                </div>
              </div>
            )}
          {isFetching && (
            <span>
              <FormattedMessage
                id="partial291"
                defaultMessage="Waiting for another participant (30 sec): "
              />
              <div styleName="loaderHolder">
                <div styleName="additionalLoaderHolder">
                  <InlineLoader />
                </div>
              </div>
            </span>
          )}

          {this.customWalletAllowed() && (
            <CustomDestAddress
              isDark={isDark}
              type={getCurrency}
              hasError={destinationError}
              value={customWallet}
              valueLink={linked.customWallet}
              initialValue={customWallet}
              onChange={this.onCustomWalletChange}
              openScan={this.openScan}
            />
          )}
          {/*
          <Fragment>
            <div styleName="walletToggle walletToggle_site">
              <div styleName="walletOpenSide" className="data-tut-togle">
                <Toggle checked={!customWalletUse} onChange={this.handleCustomWalletUse} />
                <span styleName="specify">
                  <FormattedMessage id="UseAnotherWallet" defaultMessage="Specify the receiving wallet address" />
                </span>
              </div>
              <div styleName={!customWalletUse ? "anotherRecepient anotherRecepient_active" : "anotherRecepient"}>
                <div styleName="walletInput">
                  <Input
                    inputCustomStyle={{ fontSize: "15px" }}
                    required
                    disabled={customWalletUse}
                    valueLink={linked.customWallet}
                    pattern="0-9a-zA-Z"
                    placeholder="Enter the receiving wallet address"
                  />
                  <i styleName="qrCode" className="fas fa-qrcode" onClick={this.openScan} />
                </div>
              </div>
            </div>
          </Fragment>
          */}
          <div styleName="rowBtn">
            <Button
              className="data-tut-Exchange"
              styleName="button"
              blue
              onClick={this.handleGoTrade}
              disabled={!canDoOrder}
            >
              <FormattedMessage id="partial541" defaultMessage="Exchange now" />
            </Button>
            <Button gray styleName="button" onClick={this.createOffer}>
              <FormattedMessage id="orders128" defaultMessage="Create offer" />
            </Button>
            {/*<Button
              className="data-tut-Orderbook"
              styleName="button buttonOrders"
              gray
              onClick={() => this.handlePush(isWidgetLink)}
            >
              <FormattedMessage id="partial544" defaultMessage="Order book" />
            </Button>*/}
          </div>
          {!isWidgetBuild && (
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
          )}
        </div>
      </div >
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

          {openScanCam && (
            <QrReader
              openScan={this.openScan}
              handleError={this.handleError}
              handleScan={this.handleScan}
            />
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
              <Orders sell={haveCurrency} buy={getCurrency} />
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
