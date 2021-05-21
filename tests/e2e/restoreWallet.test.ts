import testWallets from '../testWallets'

import { createBrowser, importWallet, takeScreenshot } from './utils'


jest.setTimeout(40 * 1000)

describe('Restore wallet e2e tests', () => {
  test('Restore wallet', async () => {
    const { browser, page } = await createBrowser()

    try {
      console.log('Restore wallet test')
      await importWallet(page, testWallets.btcRW.seedPhrase.split(' '))

      await page.waitForSelector('#btcAddress')

      const recoveredRWBtcAddress = await page.$eval('#btcAddress', el => el.textContent)

      expect(recoveredRWBtcAddress).toBe(testWallets.btcRW.address)

    } catch (error) {
      await takeScreenshot(page, 'RestoreWalletTestError')
      await browser.close()
      console.error('Restore wallet test error: ', error)
      expect(false).toBe(true)
    }

    await browser.close()
  })
})