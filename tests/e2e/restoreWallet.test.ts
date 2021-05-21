import testWallets from '../testWallets'

import { createBrowser, importWallet } from './utils'


jest.setTimeout(40 * 1000)

describe('Prepare to swap e2e tests', () => {
  test('restore wallet', async () => {
    const { browser, page } = await createBrowser()

    try {
      await importWallet(page, testWallets.btcRW.seedPhrase.split(' '))

      await page.waitForSelector('#btcAddress')

      const recoveredRWBtcAddress = await page.$eval('#btcAddress', el => el.textContent)

      expect(recoveredRWBtcAddress).toBe(testWallets.btcRW.address)

    } catch (error) {
      await browser.close()
      console.error('restore wallets Error: ', error)
      expect(false).toBe(true)
    }

    await browser.close()
  })
})