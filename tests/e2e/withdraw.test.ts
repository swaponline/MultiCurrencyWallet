import testWallets from '../testWallets'
import { createBrowser, importWallet, takeScreenshot, timeOut, selectSendCurrency } from './utils'

jest.setTimeout(150_000) // ms

describe('Start e2e withdraw form tests', () => {
  const checkSelectedCurrency = async (params) => {
    const { page, ticker } = params
    const feeRegExp = /(0\.)?[\d]+ [A-Z]{3,} \(.{1}(0\.)?[\d]+\)/

    await selectSendCurrency(page, ticker)
    await takeScreenshot(page, `withdrawSelect${ticker.toUpperCase()}`)

    console.log('params: ', params)

    const minerFee = await page.$eval('#feeInfoBlockMinerFee', (el) => el.textContent)
    const adminFee = await page.$eval('#feeInfoBlockAdminFee', (el) => el.textContent)
    const totalFee = await page.$eval('#feeInfoBlockTotalFee', (el) => el.textContent)

    expect(minerFee).toMatch(feeRegExp)
    expect(adminFee).toMatch(feeRegExp)
    expect(totalFee).toMatch(feeRegExp)
  }

  it('the form should displayed correctly with all currencies. Correct display of commissions', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    try {
      await importWallet(page, arrOfWords)
      // waiting for the miner commission loading

      await timeOut(5_000)

      // await page.waitForSelector('#feeInfoBlockMinerFee', { timeout: 70_000 })

      await checkSelectedCurrency({ page, ticker: 'eth' })
      await checkSelectedCurrency({ page, ticker: 'bnb' })
      await checkSelectedCurrency({ page, ticker: 'weenus' })
      await checkSelectedCurrency({ page, ticker: 'btcb' })
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
    } finally {
      await browser.close()
    }
  })

})