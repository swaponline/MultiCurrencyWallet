import BigNumber from 'bignumber.js'

import {
  createBrowser,
  importWallet,
  addAssetToWallet,
  turnOnMM,
  selectSendCurrency,
  clickOn,
  takeScreenshot,
  timeOut,
  testWallets,
} from '../utils'

const wbtcSellAmount = 0.005
const btcBuyAmount = 0.005

jest.setTimeout(1500 * 1000)

describe('Swap e2e test', () => {
  function getExchangeUrl(sourceUrl) {
    return sourceUrl.replace(/marketmaker.+/, 'exchange/{MATIC}wbtc-to-btc')
  }

  test('(MATIC)WBTC2BTC swap with internal wallets', async () => {
    const { browser: MakerBrowser, page: MakerPage } = await createBrowser()
    const { browser: TakerBrowser, page: TakerPage } = await createBrowser()

    try {
      console.log('SwapWIW -> Restore wallets')
      await importWallet({
        page: MakerPage,
        seed: testWallets.MaticTokenToBtcMMaker.seedPhrase.split(' '),
      })
      await importWallet({
        page: TakerPage,
        seed: testWallets.MaticTokenToBtcMTaker.seedPhrase.split(' '),
      })

      await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load
      await TakerPage.waitForSelector('#btcAddress') // waits for Taker wallet to load

      const recoveredMakerBtcAddress = await MakerPage.$eval('#btcAddress', el => el.textContent)
      const recoveredTakerBtcAddress = await TakerPage.$eval('#btcAddress', el => el.textContent)

      expect(recoveredMakerBtcAddress).toBe(testWallets.MaticTokenToBtcMMaker.address)
      expect(recoveredTakerBtcAddress).toBe(testWallets.MaticTokenToBtcMTaker.address)

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_RestoreWalletError')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_RestoreWalletError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Restore wallets error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Prepare pages for next actions')
      await addAssetToWallet(MakerPage, 'maticwbtc')
      await addAssetToWallet(TakerPage, 'maticwbtc')

      await timeOut(3 * 1000)

      // taker move to exchange page and try connecting to peers
      await TakerPage.goto(`${TakerPage.url()}exchange/{MATIC}wbtc-to-btc`)

      await TakerPage.evaluate((selector) => document.querySelector(selector).click(), '.dropDownSend')
      await TakerPage.click(`#Internal`)

      const [sellCurrencySelectorInput, buyCurrencySelectorInput] = await TakerPage.$$('.selectGroupInput')

      await sellCurrencySelectorInput.press('Backspace')
      await sellCurrencySelectorInput.type(wbtcSellAmount.toString())

      await clickOn({
        page: TakerPage,
        selector: '#orderbookBtn',
      })

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_PreparePagesError')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_PreparePagesError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Prepare pages for next actions error: ', error)
      expect(false).toBe(true)
    }

    let makerBtcBalance = '0'
    let makerTokenBalance = '0'

    try {
      console.log('SwapWIW -> Setup MM')
      await MakerPage.goto(`${MakerPage.url()}marketmaker/{MATIC}WBTC`)

      await timeOut(3 * 1000)

      const { btcBalance, tokenBalance } = await turnOnMM(MakerPage)
      makerBtcBalance = btcBalance
      makerTokenBalance = tokenBalance

      await MakerPage.goto(getExchangeUrl(MakerPage.url()))
      await clickOn({
        page: MakerPage,
        selector: '#orderbookBtn',
      })

      // find all maker orders
      const sellAmountOrders  = await MakerPage.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
      const buyAmountOrders   = await MakerPage.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
      const mmOrders = [...sellAmountOrders, ...buyAmountOrders]

      if (+makerBtcBalance) expect(mmOrders).toContain(makerBtcBalance)
      else console.log('maker have not btc balance')

      if (+makerTokenBalance) expect(mmOrders).toContain(makerTokenBalance)
      else console.log('maker have not token balance')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SetupMMError')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SetupMMError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Setup MM error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Check messaging')
      await timeOut(3 * 1000)

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
        ...wbtcOrders.map((amount) => amount && new BigNumber(amount).toFixed(5)),
      ]

      if (+makerBtcBalance) expect(allOrders).toContain(makerBtcBalance)
      else console.log('maker have not btc balance')

      if (+makerTokenBalance) expect(allOrders).toContain(makerTokenBalance)
      else console.log('maker have not token balance')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_MessagingError')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_MessagingError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Messaging error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Start swap')

      // go to mm settings
      await MakerPage.goBack()

      await timeOut(5_000)

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

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_StartSwap')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_StartSwap')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_StartSwapError')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_StartSwapError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Can\'t start swap: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Swap progress')
      await timeOut(3 * 1000)

      await TakerPage.waitForSelector('#firtsStepDoneIcon')

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress0_firtsStepDoneIcon')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress0_firtsStepDoneIcon')

      await TakerPage.waitForSelector('#utxoDepositHashLink', { timeout: 300 * 1000 })

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress1_utxoDepositHashLink')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress1_utxoDepositHashLink')

      await TakerPage.waitForSelector('#evmDepositHashLink', { timeout: 300 * 1000 })

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress2_evmDepositHashLink')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress2_evmDepositHashLink')

      await TakerPage.waitForSelector('#evmWithdrawalHashLink', { timeout: 300 * 1000 })

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress3_evmWithdrawalHashLink')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress3_evmWithdrawalHashLink')

      await TakerPage.waitForSelector('#utxoWithdrawalHashLink', { timeout: 300 * 1000 })

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress4_utxoWithdrawalHashLink')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress4_utxoWithdrawalHashLink')

      await TakerPage.waitForSelector('#swapCompleted')

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress5_swapCompleted')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress5_swapCompleted')

      await timeOut(15 * 1000)

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress6_swapCompleted_End')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgress6_swapCompleted_End')

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgressError')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SwapProgressError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Swap progress swap error: ', error)
      expect(false).toBe(true)
    }

    try {
      console.log('SwapWIW -> Send back (MATIC)WBTC and BTC')
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

      await selectSendCurrency({ page: MakerPage, currency: 'maticwbtc' })
      await selectSendCurrency({ page: TakerPage, currency: 'btc' })

      await MakerPage.type('#toAddressInput', testWallets.MaticTokenToBtcMTaker.ethAddress)
      await TakerPage.type('#toAddressInput', testWallets.MaticTokenToBtcMMaker.address)

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

      await MakerPage.waitForSelector('#txAmout', { timeout: 60 * 1000 })
      await TakerPage.waitForSelector('#txAmout', { timeout: 60 * 1000 })
      const wbtcTxAmout  = await MakerPage.$eval('#txAmout', el => el.textContent)
      const btcTxAmout  = await TakerPage.$eval('#txAmout', el => el.textContent)

      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SendBTC_TxInfo')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SendWBTC_TxInfo')

      expect(wbtcTxAmout).toContain(wbtcSellAmount.toString())
      expect(btcTxAmout).toContain(btcBuyAmount.toString())

    } catch (error) {
      await takeScreenshot(MakerPage, 'MakerPage_(MATIC)WBTC2BTC_SwapWIW_SendBTCError')
      await takeScreenshot(TakerPage, 'TakerPage_(MATIC)WBTC2BTC_SwapWIW_SendWBTCError')
      await MakerBrowser.close()
      await TakerBrowser.close()
      console.error('SwapWIW -> Send (MATIC)WBTC and BTC error: ', error)
      expect(false).toBe(true)
    }

    await MakerBrowser.close()
    await TakerBrowser.close()

  })
})
