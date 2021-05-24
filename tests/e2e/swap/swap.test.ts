import BigNumber from 'bignumber.js'
import testWallets from '../../testWallets'

import { createBrowser, importWallet, addAssetToWallet, turnOnMM, takeScreenshot, timeOut } from '../utils'

const takerBtcSellAmount = 500_000e-8
const takerWbtcBuyAmount = 450_000e-8

jest.setTimeout(500 * 1000)

describe('Swap e2e test', () => {

  test('Swap with internal wallets', async () => {
    const { browser: MakerBrowser, page: MakerPage } = await createBrowser()
    const { browser: TakerBrowser, page: TakerPage } = await createBrowser()

    try {
      console.log('SwapWIW -> Restore wallets')
      await importWallet(MakerPage, testWallets.btcMMaker.seedPhrase.split(' '))
      await importWallet(TakerPage, testWallets.btcMTaker.seedPhrase.split(' '))

      await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load
      await TakerPage.waitForSelector('#btcAddress') // waits for Taker wallet to load

      const recoveredMakerBtcAddress = await MakerPage.$eval('#btcAddress', el => el.textContent)
      const recoveredTakerBtcAddress = await TakerPage.$eval('#btcAddress', el => el.textContent)

      expect(recoveredMakerBtcAddress).toBe(testWallets.btcMMaker.address)
      expect(recoveredTakerBtcAddress).toBe(testWallets.btcMTaker.address)

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
      await addAssetToWallet(MakerPage, 'wbtc')
      await addAssetToWallet(TakerPage, 'wbtc')

      await timeOut(3 * 1000)

      // taker move to exchange page and try connecting to peers
      await TakerPage.$('a[href="#/exchange"]').then((aToExchange) => aToExchange.click())

      const [sellCurrencySelectorList, buyCurrencySelectorList] = await TakerPage.$$('.dropDownSelectCurrency')

      await buyCurrencySelectorList.click()
      await TakerPage.click(`#wbtc`)

      await TakerPage.evaluate((selector) => document.querySelector(selector).click(), '.dropDownReceive')
      await TakerPage.click(`#Internal`)

      const [sellCurrencySelectorInput, buyCurrencySelectorInput] = await TakerPage.$$('.inputContainer')

      await sellCurrencySelectorInput.click()
      await sellCurrencySelectorInput.press('Backspace')
      await sellCurrencySelectorInput.type(takerBtcSellAmount.toString())

      await TakerPage.$('#orderbookBtn').then((orderbookBtn) => orderbookBtn.click())

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_PreparePagesError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_PreparePagesError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Prepare pages for next actions error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Setup MM')
      await MakerPage.goto(`${MakerPage.url()}marketmaker/WBTC`)

      await timeOut(3 * 1000)

      var { btcBalance: makerBtcBalance, tokenBalance: makerTokenBalance } = await turnOnMM(MakerPage)

      await MakerPage.$('a[href="#/exchange"]').then((aToExchange) => aToExchange.click())

      await MakerPage.$('#orderbookBtn').then((orderbookBtn) => orderbookBtn.click())

      // find all maker orders
      const sellAmountOrders  = await MakerPage.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
      const buyAmountOrders   = await MakerPage.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
      const mmOrders = [...sellAmountOrders, ...buyAmountOrders];

      +makerBtcBalance ? expect(mmOrders).toContain(makerBtcBalance) : console.log('maker have not btc balance')
      +makerTokenBalance ? expect(mmOrders).toContain(makerTokenBalance) : console.log('maker have not token balance')

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

      // find btc maker orders
      const btcSellAmountsOfOrders  = await TakerPage.$$eval('.btcSellAmountOfOrder', elements => elements.map(el => el.textContent))
      const btcGetAmountsOfOrders   = await TakerPage.$$eval('.btcGetAmountOfOrder', elements => elements.map(el => el.textContent))
      const btcOrders = [...btcSellAmountsOfOrders, ...btcGetAmountsOfOrders]

      // find wbtc maker orders
      const wbtcSellAmountsOfOrders  = await TakerPage.$$eval('.wbtcSellAmountOfOrder', elements => elements.map(el => el.textContent))
      const wbtcGetAmountsOfOrders   = await TakerPage.$$eval('.wbtcGetAmountOfOrder', elements => elements.map(el => el.textContent))
      const wbtcOrders = [...wbtcSellAmountsOfOrders, ...wbtcGetAmountsOfOrders]

      const allOrders = [...btcOrders.map((amount) => new BigNumber(amount).toFixed(5)), ...wbtcOrders.map((amount) => new BigNumber(amount).toFixed(5))];

      +makerBtcBalance ? expect(allOrders).toContain(makerBtcBalance) : console.log('maker have not btc balance')
      +makerTokenBalance ? expect(allOrders).toContain(makerTokenBalance) : console.log('maker have not token balance')
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
      await timeOut(3 * 1000)

      const textOfExchangeButton = await TakerPage.$eval('#exchangeButton', el => el.textContent)
      console.log('textOfExchangeButton', textOfExchangeButton)

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

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress')

      await timeOut(15 * 1000)

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress1')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress1')

      await timeOut(15 * 1000)

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress2')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress2')

      await timeOut(20 * 1000)

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress3')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress3')

      await timeOut(20 * 1000)

      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgress4')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgress4')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_SwapWIW_SwapProgressError')
      await takeScreenshot(TakerPage, 'TakerPage_SwapWIW_SwapProgressError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Swap progress swap: ', error)
      expect(false).toBe(true)
    }

    await MakerBrowser.close()
    await TakerBrowser.close()

  })
})
