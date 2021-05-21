import BigNumber from 'bignumber.js'
import testWallets from '../testWallets'

import { createBrowser, importWallet, addAssetToWallet, turnOnMM, takeScreenshot, timeOut } from './utils'


jest.setTimeout(140 * 1000)

describe('Prepare to swap e2e tests', () => {

  test('turnOn MM', async () => {
    const { browser, page } = await createBrowser()

    try {
      await importWallet(page, testWallets.btcTurnOnMM.seedPhrase.split(' '))

      await page.waitForSelector('#btcAddress')

      const recoveredRWBtcAddress = await page.$eval('#btcAddress', el => el.textContent)

      expect(recoveredRWBtcAddress).toBe(testWallets.btcTurnOnMM.address)

    } catch (error) {
      await browser.close()
      console.error('turnOnMM restore wallets Error: ', error)
      expect(false).toBe(true)
    }

    try {
      // TurnOn MM test
      await addAssetToWallet(page, 'wbtc')

      await timeOut(3 * 1000)

      await page.goto(`${page.url()}marketmaker/WBTC`)

      await timeOut(3 * 1000)

      const { btcBalance, tokenBalance } = await turnOnMM(page)

      await page.$('a[href="#/exchange"]').then((aToExchange) => aToExchange.click())

      await page.$('#orderbookBtn').then((orderbookBtn) => orderbookBtn.click())

      // find all maker orders
      const sellAmountOrders  = await page.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
      const buyAmountOrders   = await page.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
      const mmOrders = [...sellAmountOrders, ...buyAmountOrders];

      +btcBalance ? expect(mmOrders).toContain(btcBalance) : console.log('turnOnMM address have not btc balance')
      +tokenBalance ? expect(mmOrders).toContain(tokenBalance) : console.log('turnOnMM address have not token balance')

    } catch (error) {
      await browser.close()
      console.error('TurnOn MM Error: ', error)
      expect(false).toBe(true)
    }

    await browser.close()
  })

  test('check messaging', async () => {
    const { browser: MakerBrowser, page: MakerPage } = await createBrowser()
    const { browser: TakerBrowser, page: TakerPage } = await createBrowser()

    try {

      await importWallet(MakerPage, testWallets.btcMMaker.seedPhrase.split(' '))
      await importWallet(TakerPage, testWallets.btcMTaker.seedPhrase.split(' '))


      await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load
      await TakerPage.waitForSelector('#btcAddress') // waits for Taker wallet to load

      const recoveredMakerBtcAddress = await MakerPage.$eval('#btcAddress', el => el.textContent)
      const recoveredTakerBtcAddress = await TakerPage.$eval('#btcAddress', el => el.textContent)

      expect(recoveredMakerBtcAddress).toBe(testWallets.btcMMaker.address)
      expect(recoveredTakerBtcAddress).toBe(testWallets.btcMTaker.address)

    } catch (error) {
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('restore wallets Error: ', error)
      expect(false).toBe(true)
    }

    try {
      // Prepare pages for next tests
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
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('prepare pages Error: ', error)
      expect(false).toBe(true)
    }

    try {
       // Setup MM
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
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('setup mm Error: ', error)
      expect(false).toBe(true)
    }

    try {
      // Messaging test
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
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('MESSAGING Error: ', error)
      expect(false).toBe(true)
    }
    await MakerBrowser.close()
    await TakerBrowser.close()

  })
})
