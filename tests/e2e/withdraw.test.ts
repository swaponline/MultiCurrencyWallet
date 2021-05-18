import testWallets from '../testWallets'
import { createBrowser, importWallet, takeScreenshot, timeOut, selectSendCurrency } from './utils'

jest.setTimeout(100_000) // ms

describe('Start e2e withdraw form tests', () => {

  it('the form should displayed correctly with all currencies. Correct display of commissions', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    try {
      await importWallet(page, arrOfWords)

      takeScreenshot(page, 'withdrawAfterImport')

      await selectSendCurrency(page, 'eth')
      // TODO: check a commission block

      await selectSendCurrency(page, 'bnb')
      // TODO: check a commission block

      await selectSendCurrency(page, 'weenus')
      // TODO: check a commission block

      await selectSendCurrency(page, 'wbtc')
      // TODO: check a commission block

      takeScreenshot(page, 'withdrawInTheEnd')
    } catch (error) {
      console.error(error)
    } finally {
      await browser.close()
    }
  })

})