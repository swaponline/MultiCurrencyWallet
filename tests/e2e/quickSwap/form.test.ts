import puppeteer from 'puppeteer'
import {
  createBrowser,
  importWallet,
  timeOut,
  takeScreenshot,
  clickOn,
  addTokenToWallet,
} from '../utils'

jest.setTimeout(80_000) // ms

const EVM_MNEMONIC = process.env.evmMnemonicPhrase
const EVM_ADDRESS = process.env.evmAddress

describe('Quick swap tests', () => {
  const waitingForStartup = 120_000
  let browser: undefined | puppeteer.Browser
  let page: undefined | puppeteer.Page

  beforeAll(async () => {
    const { browser: newBrowserInstance, page: newPageInstance } = await createBrowser()

    browser = newBrowserInstance
    page = newPageInstance

    await importWallet({
      page,
      seed: EVM_MNEMONIC!.split(' '),
      timeout: 40_000,
    })
  }, waitingForStartup)

  afterAll(async () => {
    if (page) {
      await page.close()
    }

    if (browser) {
      await browser.close()
    }
  })

  it('restored wallet is fine', async () => {
    if (browser && page) {
      try {
        await page.waitForSelector('#ethAddress')

        const ethAddress = await page.$eval('#ethAddress', (el) => el.textContent)
        const bnbAddress = await page.$eval('#bnbAddress', (el) => el.textContent)
        const maticAddress = await page.$eval('#maticAddress', (el) => el.textContent)

        expect(ethAddress).toBe(EVM_ADDRESS)
        expect(bnbAddress).toBe(EVM_ADDRESS)
        expect(maticAddress).toBe(EVM_ADDRESS)
      } catch (error) {
        await takeScreenshot(page, 'RestoreWalletTestError')
        await browser.close()
        console.error('Restore wallet test error: ', error)
        expect(false).toBe(true)
      }
    } else {
      throw new Error('No the browser or the page')
    }
  })

  it('the correct API response with the swap data', async () => {
    if (browser && page) {
      const tokenStandardId = 'maticerc20matic'
      const wmaticContract = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
      const amount = '0.00001'

      try {
        await addTokenToWallet({
          page,
          standardId: tokenStandardId,
          contract: wmaticContract,
        })

        await timeOut(10_000)

        await clickOn({
          page,
          selector: '[href="#/exchange/quick"]',
        })

        const [sellCurrencySelectorList, buyCurrencySelectorList] = await page.$$(
          '.dropDownSelectCurrency',
        )

        await sellCurrencySelectorList.click()
        await clickOn({
          page,
          selector: '[id="matic"]',
        })

        const buyCurrency = await page.evaluate((element) => element.textContent, buyCurrencySelectorList)

        if (buyCurrency !== 'WMATIC (MATIC)') {
          await buyCurrencySelectorList.click()
          await clickOn({
            page,
            selector: '[id="{MATIC}WMATIC"]',
          })
        }

        const spendAmountInput = await page.$('#quickSwapSpendCurrencyInput')

        if (spendAmountInput) {
          await spendAmountInput.type(amount)
        }

        await timeOut(10_000)

        const receivedAmountInput = await page.$('#quickSwapReceiveCurrencyInput')

        if (receivedAmountInput) {
          const receivedAmount = await (await receivedAmountInput.getProperty('value'))?.jsonValue()

          expect(receivedAmount).toBe(amount)
        }
      } catch (error) {
        console.error('API response error: ', error)
        await takeScreenshot(page, 'APIResponseError')
        expect(false).toBe(true)
      }
    } else {
      throw new Error('No the browser or the page')
    }
  })
})
