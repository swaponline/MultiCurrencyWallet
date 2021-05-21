import BigNumber from 'bignumber.js'
import testWallets from '../testWallets'

import { createBrowser, importWallet, addAssetToWallet, turnOnMM, takeScreenshot, timeOut } from './utils'


jest.setTimeout(140 * 1000)

describe('Prepare to swap e2e tests', () => {

  test('TurnOn MM', async () => {
    const { browser, page } = await createBrowser()

    try {
      console.log('TurnOn MM -> Restore wallet')
      await importWallet(page, testWallets.btcTurnOnMM.seedPhrase.split(' '))

      await page.waitForSelector('#btcAddress')

      const recoveredRWBtcAddress = await page.$eval('#btcAddress', el => el.textContent)

      expect(recoveredRWBtcAddress).toBe(testWallets.btcTurnOnMM.address)

    } catch (error) {
      await takeScreenshot(page, 'TurnOnMM_RestoreWalletError')
      await browser.close()
      console.error('TurnOn MM -> Restore wallet error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('TurnOn MM test')
      await addAssetToWallet(page, 'wbtc')

      await timeOut(3 * 1000)

      await page.goto(`${page.url()}marketmaker/WBTC`)

      await timeOut(3 * 1000)

      const { btcBalance, tokenBalance } = await turnOnMM(page)

      await timeOut(3 * 1000)

      await page.$('a[href="#/exchange"]').then((aToExchange) => aToExchange.click())

      await page.$('#orderbookBtn').then((orderbookBtn) => orderbookBtn.click())

      // find all your orders
      const sellAmountOrders  = await page.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
      const buyAmountOrders   = await page.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
      const mmOrders = [...sellAmountOrders, ...buyAmountOrders];

      await takeScreenshot(page, 'findAllMakerOrders')

      +btcBalance ? expect(mmOrders).toContain(btcBalance) : console.log('turnOnMM address have not btc balance')
      +tokenBalance ? expect(mmOrders).toContain(tokenBalance) : console.log('turnOnMM address have not token balance')

    } catch (error) {
      await takeScreenshot(page, 'TurnOnMMTestError')
      await browser.close()
      console.error('TurnOn MM test error: ', error)
      expect(false).toBe(true)
    }

    await browser.close()
  })

  test('Check messaging', async () => {
    const { browser: MakerBrowser, page: MakerPage } = await createBrowser()
    const { browser: TakerBrowser, page: TakerPage } = await createBrowser()

    try {
      console.log('Check messaging -> Restore wallets')
      await importWallet(MakerPage, testWallets.btcMMaker.seedPhrase.split(' '))
      await importWallet(TakerPage, testWallets.btcMTaker.seedPhrase.split(' '))

      await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load
      await TakerPage.waitForSelector('#btcAddress') // waits for Taker wallet to load

      const recoveredMakerBtcAddress = await MakerPage.$eval('#btcAddress', el => el.textContent)
      const recoveredTakerBtcAddress = await TakerPage.$eval('#btcAddress', el => el.textContent)

      expect(recoveredMakerBtcAddress).toBe(testWallets.btcMMaker.address)
      expect(recoveredTakerBtcAddress).toBe(testWallets.btcMTaker.address)

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_CheckMessaging_RestoreWalletError')
      await takeScreenshot(TakerPage, 'TakerPage_CheckMessaging_RestoreWalletError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('Check messaging -> Restore wallets error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('Check messaging -> Prepare pages for next actions')
      await addAssetToWallet(MakerPage, 'wbtc')
      await addAssetToWallet(TakerPage, 'wbtc')

      await timeOut(3 * 1000)

      // taker move to exchange page and try connecting to peers
      await TakerPage.$('a[href="#/exchange"]').then((aToExchange) => aToExchange.click())

      const [sellCurrencySelectorList, fromWalletSelectorList, buyCurrencySelectorList, toWalletSelectorList] = await TakerPage.$$('.itemsSelector')

      await buyCurrencySelectorList.click();
      await TakerPage.click(`#wbtc`)
      await TakerPage.$('#orderbookBtn').then((orderbookBtn) => orderbookBtn.click())

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_CheckMessaging_PreparePagesError')
      await takeScreenshot(TakerPage, 'TakerPage_CheckMessaging_PreparePagesError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('Check messaging -> Prepare pages for next actions error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('Check messaging -> Setup MM')
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
      await takeScreenshot(MakerPage, 'MakerPage_CheckMessaging_SetupMMError')
      await takeScreenshot(TakerPage, 'TakerPage_CheckMessaging_SetupMMError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('Check messaging -> Setup MM error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('Check messaging test')
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
      await takeScreenshot(MakerPage, 'MakerPage_CheckMessagingTestError')
      await takeScreenshot(TakerPage, 'TakerPage_CheckMessagingTestError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('Check messaging test error: ', error)
      expect(false).toBe(true)
    }
    await MakerBrowser.close()
    await TakerBrowser.close()

  })
})
