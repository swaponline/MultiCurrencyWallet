import BigNumber from 'bignumber.js'

import { createBrowser, importWallet, addAssetToWallet, turnOnMM, takeScreenshot, timeOut } from './utils'


const MAKER_SEED = ['neither', 'already', 'situate', 'silent', 'ripple', 'milk', 'paddle', 'glass', 'leopard', 'track', 'mansion', 'junk']
const makerBtcAddress = 'n2Y2rbg6wVEQnnpNxisiHK4wCDUAq59iv6'

const TAKER_SEED = ['honey', 'stereo', 'harsh', 'diary', 'select', 'episode', 'ready', 'ritual', 'best', 'target', 'paper', 'auto']
const takerBtcAddress = 'n4JjB9D9axszdsFxyxDmF43z4WwttN6oPb'


jest.setTimeout(100 * 1000)


describe('Start e2e swap tests', () => {

  it('restore wallets, turnOn MM, check messaging', async () => {
    console.log("CREATE BROWSERS")
    const { browser: MakerBrowser, page: MakerPage } = await createBrowser()
    const { browser: TakerBrowser, page: TakerPage } = await createBrowser()

    try {
      console.log("TEST IMPORT WALLETS")

      await importWallet(MakerPage, MAKER_SEED)
      await importWallet(TakerPage, TAKER_SEED)


      await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load
      await TakerPage.waitForSelector('#btcAddress') // waits for Taker wallet to load

      const recoveredMakerBtcAddress = await MakerPage.$eval('#btcAddress', el => el.textContent)
      const recoveredTakerBtcAddress = await TakerPage.$eval('#btcAddress', el => el.textContent)

      console.log("checks for restore wallets start")
      expect(recoveredMakerBtcAddress).toBe(makerBtcAddress)
      expect(recoveredTakerBtcAddress).toBe(takerBtcAddress)
      console.log("checks for restore wallets done")

    } catch (error) {
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('IMPORT WALLETS Error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log("PREPARE PAGES FOR NEXT TESTS")
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
      console.error('PREPARE PAGES Error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log("TEST SETUP MM")
       // checks setupMM
      await MakerPage.goto(`${MakerPage.url()}marketmaker/WBTC`)

      await timeOut(3 * 1000)

      var { btcBalance: makerBtcBalance, tokenBalance: makerTokenBalance } = await turnOnMM(MakerPage)

      await MakerPage.$('a[href="#/exchange"]').then((aToExchange) => aToExchange.click())

      await MakerPage.$('#orderbookBtn').then((orderbookBtn) => orderbookBtn.click())

      // find all maker orders
      const sellAmountOrders  = await MakerPage.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
      const buyAmountOrders   = await MakerPage.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
      const mmOrders = [...sellAmountOrders, ...buyAmountOrders]

      console.log("checks for setup MM start")
      +makerBtcBalance ? expect(mmOrders).toContain(makerBtcBalance) : console.log('maker have not btc balance')
      +makerTokenBalance ? expect(mmOrders).toContain(makerTokenBalance) : console.log('maker have not token balance')
      console.log("checks for setup MM done")

    } catch (error) {
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SETUP MM Error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log("TEST MESSAGING")
      await timeOut(3 * 1000)

      // find btc maker orders
      const btcSellAmountsOfOrders  = await TakerPage.$$eval('.btcSellAmountOfOrder', elements => elements.map(el => el.textContent))
      const btcGetAmountsOfOrders   = await TakerPage.$$eval('.btcGetAmountOfOrder', elements => elements.map(el => el.textContent))
      const btcOrders = [...btcSellAmountsOfOrders, ...btcGetAmountsOfOrders]

      // find wbtc maker orders
      const wbtcSellAmountsOfOrders  = await TakerPage.$$eval('.wbtcSellAmountOfOrder', elements => elements.map(el => el.textContent))
      const wbtcGetAmountsOfOrders   = await TakerPage.$$eval('.wbtcGetAmountOfOrder', elements => elements.map(el => el.textContent))
      const wbtcOrders = [...wbtcSellAmountsOfOrders, ...wbtcGetAmountsOfOrders]

      const allOrders = [...btcOrders.map((amount) => new BigNumber(amount).toFixed(5)), ...wbtcOrders.map((amount) => new BigNumber(amount).toFixed(5))]

      console.log("checks for messaging start")
      +makerBtcBalance ? expect(allOrders).toContain(makerBtcBalance) : console.log('maker have not btc balance')
      +makerTokenBalance ? expect(allOrders).toContain(makerTokenBalance) : console.log('maker have not token balance')
      console.log("checks for messaging done")
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
