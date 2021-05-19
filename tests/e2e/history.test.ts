import testWallets from '../testWallets'
import { createBrowser, importWallet, timeOut } from './utils'

jest.setTimeout(100_000) // ms

describe('Start e2e history tests', () => {

  it('there should be a correct display of balances', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    try {
      await importWallet(page, arrOfWords)
      await timeOut(10_000)
      
      await page.goto(`${page.url()}history`)
      await timeOut(5_000)

      const txAmountInfo = await page.$eval('#historyRowAmountInfo', (el) => el.textContent)

      // a suitable example: + 1.2 LTC BEP20
      expect(txAmountInfo).toMatch(/^(\-|\+) (0\.)?[\d]+ [A-Z]{3,}( [A-Z]{3}[\d]{1,3})?$/)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
    } finally {
      await browser.close()
    }
  })

})