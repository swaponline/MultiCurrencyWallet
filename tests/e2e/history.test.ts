import testWallets from '../testWallets'
import { createBrowser, importWallet, takeScreenshot, timeOut, selectSendCurrency } from './utils'

jest.setTimeout(30_000) // ms

describe('Start e2e history tests', () => {

  it('there should be a correct display of balances', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    try {
      await importWallet(page, arrOfWords)
    } catch (error) {
      console.error(error)
    } finally {
      await browser.close()
    }
  })

})