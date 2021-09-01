import puppeteer from 'puppeteer'
import {
  createBrowser,
  importWallet,
  selectSendCurrency,
  takeScreenshot,
  timeOut,
  clickOn,
} from '../utils'
import testWallets from '../../testWallets'

type TxData = {
  to: string
  amount: number
}

describe('Send EVM coins from the withdraw form', () => {
  const waitingForStartup = 160_000
  const waitingForTheTest = 60_000
  const dataForTx: [string, TxData][] = [
    [
      'ETH',
      {
        to: testWallets.eth.address.toLowerCase(),
        amount: 0.001,
      },
    ],
    [
      'BNB',
      {
        to: testWallets.bnb.address.toLowerCase(),
        amount: 0.001,
      },
    ],
    [
      'MATIC',
      {
        to: testWallets.matic.address.toLowerCase(),
        amount: 0.001,
      },
    ],
    [
      'ARBETH',
      {
        to: testWallets.arbeth.address.toLowerCase(),
        amount: 0.0001,
      },
    ],
  ]

  let browser: undefined | puppeteer.Browser = undefined
  let page: undefined | puppeteer.Page = undefined

  beforeAll(async () => {
    const { browser: newBrowserInstance, page: newPageInstance } = await createBrowser()

    browser = newBrowserInstance
    page = newPageInstance

    await importWallet({
      page: page,
      seed: testWallets.eth.seedPhrase.split(' '),
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

  it.each(dataForTx)(
    'Sending %s transaction',
    async (coinName: string, txData: TxData) => {
      const { to, amount } = txData
      const lowerName = coinName.toLowerCase()

      if (browser && page) {
        try {
          await page.waitForSelector(`#${lowerName}Address`)
          await timeOut(3_000)

          const coinAddress = await page.$eval(`#${lowerName}Address`, (el) => el.textContent)

          expect(coinAddress).toBe(testWallets.eth.address)
        } catch (error) {
          await takeScreenshot(page, `Send${coinName}_RestoreWalletError`)
          await browser.close()
          expect(false).toBe(true)
        }

        try {
          await timeOut(3_000)
          await selectSendCurrency({ page, currency: lowerName })

          await page.type('#toAddressInput', to)
          await page.type('#amountInput', String(amount))

          // daley for fee fetching
          await timeOut(5_000)

          await clickOn({
            page,
            selector: '#sendButton',
          })

          await page.waitForSelector('#txAmout', { timeout: 30_000 })

          const txAmount = await page.$eval('#txAmout', (el) => el.textContent)

          expect(txAmount).toContain(String(amount))
        } catch (error) {
          await takeScreenshot(page, `Send${coinName}Error`)
          await browser.close()
          console.error(`Send ${coinName}: `, error)
          expect(false).toBe(true)
        }

        await clickOn({
          page,
          selector: '#modalCloseButton',
        })
        await clickOn({
          page,
          selector: 'a[href="#/"]',
        })
      } else {
        throw new Error('No the browser or the page')
      }
    },
    waitingForTheTest
  )
})
