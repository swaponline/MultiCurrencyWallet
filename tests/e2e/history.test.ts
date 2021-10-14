import { createBrowser, importWallet, timeOut, takeScreenshot, testWallets } from './utils'

jest.setTimeout(100_000) // ms

describe('History tests', () => {

  it('there should be a correct display of balances', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    try {
      console.log('History test')
      await importWallet({
        page,
        seed: arrOfWords,
      })
      await timeOut(10_000)

      await page.goto(`${page.url()}history`)
      await timeOut(5_000)

      const txAmountInfo = await page.$eval('#historyRowAmountInfo', (el) => el.textContent)

      // a suitable example: + 1.2 LTC BEP20
      expect(txAmountInfo).toMatch(/^(-|\+) (0\.)?[\d]+ [A-Z]{3,}( [A-Z]{3}[\d]{1,3})?$/)
    } catch (error) {
      console.error('History test error', error)
      await takeScreenshot(page, 'HistoryTestError')
      expect(false).toBe(true)
    } finally {
      await browser.close()
    }
  })

})
