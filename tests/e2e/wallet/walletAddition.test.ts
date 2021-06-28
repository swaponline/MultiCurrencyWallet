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
  const wallets = [
    ['eth', 'Ethereum'],
    ['bnb', 'Binance Coin'],
    ['matic', 'MATIC Token'],
  ]

  async function checkWalletDisplay(params) {
    const { page, name, expectedTitle } = params

    const walletTitle = await page.$eval(`#${name}WalletTitle`, el => el.textContent)

    if (walletTitle !== expectedTitle) {
      throw new Error('incorrect display for ${}')
    }
  }

  beforeAll(async () => {
    const { browser, page } = await createBrowser()

    testBrowser = browser
    testPage = page

    await page.waitForSelector('#preloaderCreateBtn')
    await page.click('#preloaderCreateBtn')

    await timeOut(60_000)
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

      await checkWalletDisplay({
        page: testPage,
        name: 'btc',
        expectedTitle: 'Bitcoin'
      })
    } else {
      throw new Error('page is not found')
    }
  })

  it.each(wallets)('adding %s wallet', async (walletName, walletTitle) => {
    if (testPage) {
      await addAssetToWallet(testPage, walletName)

      await checkWalletDisplay({
        page: testPage,
        name: walletName,
        expectedTitle: walletTitle,
      })

      await takeScreenshot(testPage, `Add${walletName}Wallet`)
    } else {
      throw new Error('page is not found')
    }
  })
})
