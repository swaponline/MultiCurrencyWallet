import BigNumber from 'bignumber.js'
import testWallets from '../../testWallets'

import {
  createBrowser,
  importWallet,
  addAssetToWallet,
  turnOnMM,
  selectSendCurrency,
  clickOn,
  takeScreenshot,
  timeOut,
} from '../utils'

const wbtcSellAmount = 500_000e-8
const btcBuyAmount = 500_000e-8

jest.setTimeout(1500 * 1000)

describe('Swap e2e test', () => {

  test('(MATIC)WBTC/BTC swap with internal wallets', async () => {
    const { browser: MakerBrowser, page: MakerPage } = await createBrowser()
    const { browser: TakerBrowser, page: TakerPage } = await createBrowser()

    try {
      console.log('SwapWIW -> Restore wallets')
      await importWallet({
        page: MakerPage,
        seed: testWallets.btcMMaker.seedPhrase.split(' '),
      })
      await importWallet({
        page: TakerPage,
        seed: testWallets.btcMTaker.seedPhrase.split(' '),
      })

      await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load

      await addAssetToWallet(TakerPage, 'maticwbtc')
      await timeOut(3 * 1000)

      await TakerPage.waitForSelector('#maticwbtcAddress') // waits for Taker wallet to load

      const recoveredMakerBtcAddress = await MakerPage.$eval('#btcAddress', el => el.textContent)
      const recoveredTakerWbtcAddress = await TakerPage.$eval('#maticwbtcAddress', el => el.textContent)

      expect(recoveredMakerBtcAddress).toBe(testWallets.btcMMaker.address)
      expect(recoveredTakerWbtcAddress).toBe(testWallets.btcMTaker.ethAddress)

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_RestoreWalletError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_RestoreWalletError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Restore wallets error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Prepare pages for next actions')

      await addAssetToWallet(MakerPage, 'maticwbtc')

      await timeOut(3 * 1000)

      // taker move to exchange page and try connecting to peers
      await clickOn({
        page: TakerPage,
        selector: 'a[href="#/exchange"]',
      })

      const [sellCurrencySelectorList, buyCurrencySelectorList] = await TakerPage.$$('.dropDownSelectCurrency')

      await buyCurrencySelectorList.click()
      await TakerPage.click("[id='btc']")

      await TakerPage.evaluate((selector) => document.querySelector(selector).click(), '.dropDownReceive')
      await TakerPage.click(`#Internal`)

      const [sellCurrencySelectorInput, buyCurrencySelectorInput] = await TakerPage.$$('.inputContainer')

      await sellCurrencySelectorInput.click()
      await sellCurrencySelectorInput.press('Backspace')
      await sellCurrencySelectorInput.type(wbtcSellAmount.toString())

      await clickOn({
        page: TakerPage,
        selector: '#orderbookBtn',
      })

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_PreparePagesError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_PreparePagesError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Prepare pages for next actions error: ', error)
      expect(false).toBe(true)
    }

    console.log('SwapWIW -> Setup MM')
    await MakerPage.goto(`${MakerPage.url()}marketmaker/{MATIC}WBTC`)

    await timeOut(3 * 1000)

    const {
      btcBalance: makerBtcBalance,
      tokenBalance: makerTokenBalance,
    } = await turnOnMM(MakerPage)

    try {
      await clickOn({
        page: MakerPage,
        selector: 'a[href="#/exchange"]',
      })
      await clickOn({
        page: MakerPage,
        selector: '#orderbookBtn',
      })

      const [sellCurrencySelectorList, buyCurrencySelectorList] = await MakerPage.$$('.dropDownSelectCurrency')

      await buyCurrencySelectorList.click()
      await MakerPage.click("[id='{MATIC}wbtc']")

      await timeOut(25_000)

      // find all maker orders
      const sellAmountOrders  = await MakerPage.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
      const buyAmountOrders   = await MakerPage.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
      const mmOrders = [...sellAmountOrders, ...buyAmountOrders];

      +makerBtcBalance ? expect(mmOrders).toContain(makerBtcBalance) : console.log('maker has not btc balance')
      +makerTokenBalance ? expect(mmOrders).toContain(makerTokenBalance) : console.log('maker has not token balance')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SetupMMError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SetupMMError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Setup MM error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Check messaging')
      await timeOut(3 * 1000)

      const [sellCurrencySelectorList, buyCurrencySelectorList] = await TakerPage.$$('.dropDownSelectCurrency')

      await sellCurrencySelectorList.click()
      await TakerPage.click("[id='{MATIC}wbtc']")
      await buyCurrencySelectorList.click()
      await TakerPage.click("[id='btc']")

      await timeOut(30_000)

      // find btc orders
      const btcSellAmountsOfOrders  = await TakerPage.$$eval('.btcSellAmountOfOrder', elements => elements.map(el => el.textContent))
      const btcGetAmountsOfOrders   = await TakerPage.$$eval('.btcGetAmountOfOrder', elements => elements.map(el => el.textContent))
      const btcOrders = [...btcSellAmountsOfOrders, ...btcGetAmountsOfOrders]

      // find wbtc orders
      const wbtcSellAmountsOfOrders  = await TakerPage.$$eval('.wbtcSellAmountOfOrder', elements => elements.map(el => el.textContent))
      const wbtcGetAmountsOfOrders   = await TakerPage.$$eval('.wbtcGetAmountOfOrder', elements => elements.map(el => el.textContent))
      const wbtcOrders = [...wbtcSellAmountsOfOrders, ...wbtcGetAmountsOfOrders]

      const allOrders = [
        ...btcOrders.map((amount) => amount && new BigNumber(amount).toFixed(5)),
        ...wbtcOrders.map((amount) => amount && new BigNumber(amount).toFixed(5))
      ];

      +makerBtcBalance ? expect(allOrders).toContain(makerBtcBalance) : console.log('maker has not btc balance')
      +makerTokenBalance ? expect(allOrders).toContain(makerTokenBalance) : console.log('maker has not token balance')
    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_MessagingError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_MessagingError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Messaging error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Start swap')

      await timeOut(5_000)

      await TakerPage.evaluate((selector) => document.querySelector(selector).click(), '.dropDownSend')
      await TakerPage.click(`#Internal`)

      let textOfExchangeButton = await TakerPage.$eval('#exchangeButton', el => el.textContent)
      console.log('Taker exchange button: ', textOfExchangeButton)

      // at first need to approve token amount
      if (textOfExchangeButton === 'Approve {MATIC}WBTC') {
        await TakerPage.click('#exchangeButton')
        // wait a modal about successful approving
        await TakerPage.waitForSelector('#notificationModal', {
          timeout: 60_000,
        })
        // update button content after that
        await timeOut(3_000)
        textOfExchangeButton = await TakerPage.$eval('#exchangeButton', el => el.textContent)
      }

      expect(textOfExchangeButton).toBe('Exchange now')

      await TakerPage.click('#exchangeButton')

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_StartSwap')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_StartSwap')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_StartSwapError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_StartSwapError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Can\'t start swap: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Swap progress')
      await timeOut(3 * 1000)

      await TakerPage.waitForSelector('#firtsStepDoneIcon')

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress0_firtsStepDoneIcon')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress0_firtsStepDoneIcon')

      await TakerPage.waitForSelector('#utxoDepositHashLink', {timeout: 150 * 1000})

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress1_utxoDepositHashLink')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress1_utxoDepositHashLink')

      await TakerPage.waitForSelector('#evmDepositHashLink', {timeout: 150 * 1000})

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress2_evmDepositHashLink')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress2_evmDepositHashLink')

      await TakerPage.waitForSelector('#evmWithdrawalHashLink', {timeout: 300 * 1000})

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress3_evmWithdrawalHashLink')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress3_evmWithdrawalHashLink')

      await TakerPage.waitForSelector('#utxoWithdrawalHashLink', {timeout: 300 * 1000})

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress4_utxoWithdrawalHashLink')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress4_utxoWithdrawalHashLink')

      await TakerPage.waitForSelector('#swapCompleted')

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress5_swapCompleted')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress5_swapCompleted')

      await timeOut(15 * 1000)

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress6_swapCompleted_End')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress6_swapCompleted_End')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgressError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgressError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Swap progress swap error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Send (MATIC)WBTC and BTC')
      await timeOut(3 * 1000)

      await clickOn({
        page: MakerPage,
        selector: 'a[href="#/"]',
      })
      await clickOn({
        page: TakerPage,
        selector: 'a[href="#/"]',
      })

      await timeOut(3 * 1000)

      await selectSendCurrency({page: MakerPage, currency: 'maticwbtc'})
      await selectSendCurrency({page: TakerPage, currency: 'btc'})

      await MakerPage.type('#toAddressInput', testWallets.btcMTaker.ethAddress)
      await TakerPage.type('#toAddressInput', testWallets.btcMMaker.address)

      await MakerPage.type('#amountInput', wbtcSellAmount.toString())
      await TakerPage.type('#amountInput', btcBuyAmount.toString())

      await timeOut(10 * 1000)

      await TakerPage.waitForSelector('#feeInfoBlockMinerFee')
      await TakerPage.evaluate((selector) => document.querySelector(selector).click(), '#slow')

      await timeOut(5 * 1000)

      await clickOn({
        page: TakerPage,
        selector: '#sendButton',
      })
      await clickOn({
        page: MakerPage,
        selector: '#sendButton',
      })

      await MakerPage.waitForSelector('#txAmout', {timeout: 60 * 1000})
      await TakerPage.waitForSelector('#txAmout', {timeout: 60 * 1000})
      const wbtcTxAmout  = await MakerPage.$eval('#txAmout', el => el.textContent)
      const btcTxAmout  = await TakerPage.$eval('#txAmout', el => el.textContent)

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SendBTC_TxInfo')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SendWBTC_TxInfo')

      expect(wbtcTxAmout).toContain(wbtcSellAmount.toString())
      expect(btcTxAmout).toContain(btcBuyAmount.toString())

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SendBTCError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SendWBTCError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Send (MATIC)WBTC and BTC error: ', error)
      expect(false).toBe(true)
    }

    await MakerBrowser.close()
    await TakerBrowser.close()

  })
})
