import puppeteer from 'puppeteer'
import { createBrowser, addAssetToWallet, takeScreenshot, timeOut } from '../utils'

jest.setTimeout(150 * 1000)

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

    page.waitForTimeout(90_000)
  })

  afterAll(async () => {
    await testBrowser?.close()
  })

  it('adding btc wallet', async () => {
    if (testPage) {
      await addAssetToWallet(testPage, 'btc')
    } else {
      throw new Error('page is not found')
    }
  })

  it.each(wallets)('adding %s wallet', async (walletName) => {
    if (testPage) {
      await addAssetToWallet(testPage, walletName)

      takeScreenshot(testPage, `Add${walletName}Wallet`)
    } else {
      throw new Error('page is not found')
    }
  })
})
