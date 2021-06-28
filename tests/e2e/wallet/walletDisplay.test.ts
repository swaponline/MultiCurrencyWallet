import puppeteer from 'puppeteer'
import {
  createBrowser,
  addAssetToWallet,
  takeScreenshot,
  clickOn,
  timeOut,
} from '../utils'

jest.setTimeout(250 * 1000)

describe('Displaying wallets', () => {
  let testBrowser: puppeteer.Browser | undefined = undefined
  let testPage: puppeteer.Page | undefined = undefined
  const wallets = ['eth', 'bnb', 'matic']

  beforeAll(async () => {
    const { browser, page } = await createBrowser()

    testBrowser = browser
    testPage = page

    await page.waitForSelector('#preloaderCreateBtn')
    await page.click('#preloaderCreateBtn')

    timeOut(60_000)
  })

  afterAll(async () => {
    await testBrowser?.close()
  })

  it('adding btc wallet', async () => {
    if (testPage) {
      await clickOn({
        page: testPage,
        selector: '#btcWallet',
      })
      await clickOn({
        page: testPage,
        selector: '#continueBtn',
      })
      await clickOn({
        page: testPage,
        selector: '#withoutSecure',
      })
      await clickOn({
        page: testPage,
        selector: '#createWalletBtn',
      })

      // check wallet display
    } else {
      throw new Error('page is not found')
    }
  })

  it.each(wallets)('adding %s wallet', async (walletName) => {
    if (testPage) {
      await addAssetToWallet(testPage, walletName)

      // check wallet display

      takeScreenshot(testPage, `Add${walletName}Wallet`)
    } else {
      throw new Error('page is not found')
    }
  })
})
