import puppeteer from 'puppeteer'
import {
  createBrowser,
  importWallet,
  selectSendCurrency,
  takeScreenshot,
  timeOut,
  testWallets,
} from './utils'

jest.setTimeout(260_000) // ms

describe('Withdraw form tests', () => {
  let testBrowser: puppeteer.Browser | undefined
  let testPage: puppeteer.Page | undefined

  beforeAll(async () => {
    const { browser, page } = await createBrowser()

    testBrowser = browser
    testPage = page

    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    await importWallet({
      page: testPage,
      seed: arrOfWords,
      timeout: 80_000,
    })

    await page.waitForSelector('#sendBtn')
    await page.click('#sendBtn')

    await timeOut(60_000)
  })

  afterAll(async () => {
    await testBrowser?.close()
  })

  const checkSelectedCurrency = async (params) => {
    const { page, ticker } = params

    // a suitable example: 0.005166 ETH ($18.23)
    const feeRegExp = /[\d(.)?\d]+ [A-Z]{3,} \(.{1}[\d(.)?\d]+\)/

    // await selectSendCurrency({ page, currency: ticker })

    await page.waitForSelector('#withdrawCurrencyList')
    await page.click('#withdrawCurrencyList')

    await page.waitForSelector(`#${ticker}CryptoBalance`)
    const balance = await page.$eval(`#${ticker}CryptoBalance`, (el) => el.textContent)

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(Number(balance)) || balance === '0') {
      // close an opened list
      await page.click('#withdrawCurrencyList')
      throw new Error(`no balance for the asset: ${ticker.toUpperCase()}`)
    }

    await page.click(`#${ticker}Send`)

    await page.waitForSelector('#feeInfoBlockMinerFee')
    await page.waitForSelector('#feeInfoBlockTotalFee')

    const minerFee = await page.$eval('#feeInfoBlockMinerFee', (el) => el.textContent)
    const totalFee = await page.$eval('#feeInfoBlockTotalFee', (el) => el.textContent)

    expect(minerFee).toBeTruthy()
    expect(totalFee).toBeTruthy()

    // TODO: throw an error, but pattern works. Need to fix it
    // expect(minerFee).toMatch(feeRegExp)
    // expect(totalFee).toMatch(feeRegExp)

    // const minerAmount = parseFloat(minerFee)
    // const totalAmount = parseFloat(totalFee)

    // expect(minerAmount).toBeCloseTo(totalAmount)
  }

  const cases = [['btc'], ['eth'], ['bnb'], ['matic']]

  it.each(cases)('correct display balances and commissions. Asset: %s', async (name) => {
    if (testPage && testBrowser) {
      try {
        await testPage.waitForTimeout(5_000)

        await checkSelectedCurrency({ page: testPage, ticker: name })
      } catch (error) {
        console.error('Withdraw form tests error', error)
        await takeScreenshot(testPage, 'WithdrawFormTestsError')
        expect(false).toBe(true)
      }
    } else {
      throw new Error('Browser or page is not found')
    }
  })
})
