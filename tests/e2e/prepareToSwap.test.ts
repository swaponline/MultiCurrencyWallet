import BigNumber from 'bignumber.js'

import {
  createBrowser,
  importWallet,
  addAssetToWallet,
  turnOnMM,
  clickOn,
  takeScreenshot,
  timeOut,
  testWallets,
} from './utils'

jest.setTimeout(330_000)

describe('Prepare to swap e2e tests', () => {
  function getExchangeUrl(sourceUrl) {
    return sourceUrl.replace(/marketmaker.+/, 'exchange/btc-to-{ETH}wbtc')
  }

  test('TurnOn MM', async () => {
    const { browser, page } = await createBrowser()

    try {
      await importWallet({
        page,
        seed: testWallets.btcTurnOnMM.seedPhrase.split(' '),
        timeout: 60_000,
      })

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
      await addAssetToWallet(page, 'ethwbtc')

      await timeOut(3 * 1000)

      await page.goto(`${page.url()}marketmaker/{ETH}WBTC`)

      await timeOut(3 * 1000)

      const { btcBalance, tokenBalance } = await turnOnMM(page)

      await timeOut(3 * 1000)

      await page.goto(getExchangeUrl(page.url()))
      await clickOn({
        page,
        selector: '#orderbookBtn',
      })

      await timeOut(10_000)

      // find all your orders
      const sellAmountOrders  = await page.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
      const buyAmountOrders   = await page.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
      const mmOrders = [...sellAmountOrders, ...buyAmountOrders]

      if (+btcBalance) expect(mmOrders).toContain(btcBalance)
      else console.log('turnOnMM address have not btc balance')

      if (+tokenBalance) expect(mmOrders).toContain(tokenBalance)
      else console.log('turnOnMM address have not token balance')

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
      await importWallet({
        page: MakerPage,
        seed: testWallets.btcToEthTokenMMaker.seedPhrase.split(' '),
        timeout: 60_000,
      })
      await importWallet({
        page: TakerPage,
        seed: testWallets.btcToEthTokenMTaker.seedPhrase.split(' '),
        timeout: 60_000,
      })

      await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load
      await TakerPage.waitForSelector('#btcAddress') // waits for Taker wallet to load

      const recoveredMakerBtcAddress = await MakerPage.$eval('#btcAddress', el => el.textContent)
      const recoveredTakerBtcAddress = await TakerPage.$eval('#btcAddress', el => el.textContent)

      expect(recoveredMakerBtcAddress).toBe(testWallets.btcToEthTokenMMaker.address)
      expect(recoveredTakerBtcAddress).toBe(testWallets.btcToEthTokenMTaker.address)

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_CheckMessaging_RestoreWalletError')
      await takeScreenshot(TakerPage, 'TakerPage_CheckMessaging_RestoreWalletError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('Check messaging -> Restore wallets error: ', error)
      expect(false).toBe(true)
    }

    try {
      await addAssetToWallet(MakerPage, 'ethwbtc')
      await addAssetToWallet(TakerPage, 'ethwbtc')

      await timeOut(3 * 1000)

      // taker move to exchange page and try connecting to peers
      await TakerPage.goto(`${TakerPage.url()}exchange/btc-to-{ETH}wbtc`)

      // await TakerPage.waitForSelector('.dropDownSelectCurrency')
      const [sellCurrencySelectorList, buyCurrencySelectorList] = await TakerPage.$$('.dropDownSelectCurrency')

      await buyCurrencySelectorList.click()
      await TakerPage.click('[id=\'{ETH}wbtc\']')
      await clickOn({
        page: TakerPage,
        selector: '#orderbookBtn',
      })

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_CheckMessaging_PreparePagesError')
      await takeScreenshot(TakerPage, 'TakerPage_CheckMessaging_PreparePagesError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('Check messaging -> Prepare pages for next actions error: ', error)
      expect(false).toBe(true)
    }

    let makerBtcBalance = '0'
    let makerTokenBalance = '0'

    try {
      await MakerPage.goto(`${MakerPage.url()}marketmaker/{ETH}WBTC`)

      await timeOut(3 * 1000)

      const { btcBalance, tokenBalance } = await turnOnMM(MakerPage)
      makerBtcBalance = btcBalance
      makerTokenBalance = tokenBalance

      await MakerPage.goto(getExchangeUrl(MakerPage.url()))

      await clickOn({
        page: MakerPage,
        selector: '#orderbookBtn',
      })

      await timeOut(30_000)

      // find all maker orders
      const sellAmountOrders  = await MakerPage.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
      const buyAmountOrders   = await MakerPage.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
      const mmOrders = [...sellAmountOrders, ...buyAmountOrders]

      if (+makerBtcBalance) expect(mmOrders).toContain(makerBtcBalance)
      else console.log('maker have not btc balance')

      if (+makerTokenBalance) expect(mmOrders).toContain(makerTokenBalance)
      else console.log('maker have not token balance')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_CheckMessaging_SetupMMError')
      await takeScreenshot(TakerPage, 'TakerPage_CheckMessaging_SetupMMError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('Check messaging -> Setup MM error: ', error)
      expect(false).toBe(true)
    }

    try {
      await timeOut(10_000)

      // find btc maker orders
      const btcSellAmountsOfOrders  = await TakerPage.$$eval('.btcSellAmountOfOrder', elements => elements.map(el => el.textContent))
      const btcGetAmountsOfOrders   = await TakerPage.$$eval('.btcGetAmountOfOrder', elements => elements.map(el => el.textContent))
      const btcOrders = [...btcSellAmountsOfOrders, ...btcGetAmountsOfOrders]

      // find wbtc maker orders
      const wbtcSellAmountsOfOrders  = await TakerPage.$$eval('.wbtcSellAmountOfOrder', elements => elements.map(el => el.textContent))
      const wbtcGetAmountsOfOrders   = await TakerPage.$$eval('.wbtcGetAmountOfOrder', elements => elements.map(el => el.textContent))
      const wbtcOrders = [...wbtcSellAmountsOfOrders, ...wbtcGetAmountsOfOrders]

      const allOrders = [
        ...btcOrders.map((amount) => amount && new BigNumber(amount).toFixed(5)),
        ...wbtcOrders.map((amount) => amount && new BigNumber(amount).toFixed(5)),
      ]

      if (+makerBtcBalance) expect(allOrders).toContain(makerBtcBalance)
      else console.log('maker have not btc balance')

      if (+makerTokenBalance) expect(allOrders).toContain(makerTokenBalance)
      else console.log('maker have not token balance')

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
