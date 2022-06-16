import puppeteer from 'puppeteer'
import {
  createBrowser,
  addAssetToWallet,
  takeScreenshot,
  clickOn,
  timeOut,
} from '../utils'

jest.setTimeout(250 * 1000)

describe('Adding coins', () => {
  let testBrowser: puppeteer.Browser | undefined
  let testPage: puppeteer.Page | undefined
  const wallets = [
    ['eth', 'Ethereum'],
    ['bnb', 'Binance Coin'],
    ['matic', 'MATIC Token'],
    ['arbeth', 'Arbitrum ETH'],
    ['xdai', 'xDai'],
    ['aureth', 'Aurora ETH'],
    ['ftm', 'Fantom'],
    ['avax', 'Avalanche'],
    ['movr', 'Moonriver'],
    ['one', 'Harmony One'],
    ['ghost', 'ghost'],
    // temporary disabled
    // ['next', 'NEXT.coin'],
  ]

  async function checkWalletDisplay(params) {
    const { page, name, expectedTitle } = params

    const walletTitle = await page.$eval(`#${name}WalletTitle`, el => el.textContent)

    if (walletTitle !== expectedTitle) {
      throw new Error(`incorrect display for ${name.toUpperCase()} wallet`)
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
      try {
        await clickOn({
          page: testPage,
          selector: '#btcWallet',
        })
        await clickOn({
          page: testPage,
          selector: '#continueBtn',
        })

        await checkWalletDisplay({
          page: testPage,
          name: 'btc',
          expectedTitle: 'Bitcoin',
        })
      } catch (error) {
        console.error('Adding btc wallet: ', error)
        await takeScreenshot(testPage, 'AddingWalletError_btc')
        expect(false).toBe(true)
      }
    } else {
      throw new Error('page is not found')
    }
  })

  it.each(wallets)('adding %s wallet', async (walletName, walletTitle) => {
    if (testPage) {
      try {
        await addAssetToWallet(testPage, walletName)

        await checkWalletDisplay({
          page: testPage,
          name: walletName,
          expectedTitle: walletTitle,
        })
      } catch (error) {
        console.error(`Adding ${walletName} wallet: `, error)
        await takeScreenshot(testPage, `AddingWalletError_${walletName}`)
        expect(false).toBe(true)
      }
    } else {
      throw new Error('page is not found')
    }
  })
})
