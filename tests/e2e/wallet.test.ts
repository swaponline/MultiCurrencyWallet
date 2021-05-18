import testWallets from '../testWallets'
import { createBrowser, importWallet, takeScreenshot, timeOut } from './utils'

jest.setTimeout(60_000) // ms

describe('Start e2e wallet tests', () => {

  it('the balances should be displayed and updated correctly', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    try {
      await importWallet(page, arrOfWords)

      await timeOut(5000)
      await takeScreenshot(page, 'walletPageAfterImport')

      await page.waitForSelector('#walletRowUpdateBalanceBtn')
      await page.waitForSelector('#walletRowCryptoBalance')

      const balances = await page.$$eval('#walletRowCryptoBalance', (balanceTags) => {
        return balanceTags.map((tag) => tag.textContent)
      })

      expect(balances).toBeDefined()

      balances.forEach((strBalance) => {
        expect(Number(strBalance)).not.toBeNaN()
      })

      const balanceUpdateBtns = await page.$$('#walletRowUpdateBalanceBtn')
      
      balanceUpdateBtns.forEach((btn) => btn.click())

      // waiting for the balances to be updated
      await timeOut(300)
      await takeScreenshot(page, 'walletPageUpdatesBalances')
      
      balances.forEach((strBalance) => {
        expect(Number(strBalance)).not.toBeNaN()
      })
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
    } finally {
      await browser.close()
    }
  })

})