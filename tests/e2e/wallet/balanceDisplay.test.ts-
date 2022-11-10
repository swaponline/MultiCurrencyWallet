import { createBrowser, importWallet, timeOut, takeScreenshot, testWallets } from '../utils'

jest.setTimeout(80_000) // ms

describe('Wallet tests', () => {

  test('Restore wallet', async () => {
    const { browser, page } = await createBrowser()

    try {
      await importWallet({
        page,
        seed: testWallets.btcRW.seedPhrase.split(' '),
        timeout: 40_000,
      })

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

  it('the balances should be displayed and updated correctly', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    try {
      await importWallet({
        page,
        seed: arrOfWords,
        timeout: 40_000,
      })

      await timeOut(5000)

      await page.waitForSelector('#walletRowUpdateBalanceBtn')
      await page.waitForSelector('#walletRowCryptoBalance')

      const balances = await page.$$eval(
        '#walletRowCryptoBalance',
        (balanceTags) => balanceTags.map((tag) => tag.textContent),
      )

      expect(balances).toBeDefined()

      balances.forEach((strBalance) => {
        expect(Number(strBalance)).not.toBeNaN()
      })

      const balanceUpdateBtns = await page.$$('#walletRowUpdateBalanceBtn')

      balanceUpdateBtns.forEach((btn) => btn.click())

      // waiting for the balances to be updated
      await timeOut(300)

      balances.forEach((strBalance) => {
        expect(Number(strBalance)).not.toBeNaN()
      })
    } catch (error) {
      console.error('Balance test error', error)
      await takeScreenshot(page, 'BalanceTestError')
      expect(false).toBe(true)
    } finally {
      await browser.close()
    }
  })

})
