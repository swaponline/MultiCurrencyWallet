import {
  createBrowser,
  importWallet,
  selectSendCurrency,
  takeScreenshot,
  timeOut,
  testWallets,
} from '../utils'

const amount = 50_000e-8

jest.setTimeout(150 * 1000)

describe('Send', () => {

  test('BTC', async () => {
    const { browser, page } = await createBrowser()

    try {
      await importWallet({
        page,
        seed: testWallets.btcToEthTokenMTaker.seedPhrase.split(' '),
      })

      await page.waitForSelector('#btcAddress') // waits for Maker wallet to load

      await timeOut(3 * 1000)

      const recoveredBtcAddress = await page.$eval('#btcAddress', el => el.textContent)

      expect(recoveredBtcAddress).toBe(testWallets.btcToEthTokenMTaker.address)

    } catch (error) {
      await takeScreenshot(page, 'SendBTC_RestoreWalletError')
      await browser.close()
      expect(false).toBe(true)
    }

    try {
      await timeOut(3 * 1000)

      await selectSendCurrency({ page, currency: 'btc' })

      await page.type('#toAddressInput', testWallets.btcToEthTokenMMaker.address)

      await page.type('#amountInput', amount.toString())

      await timeOut(10 * 1000)

      await page.waitForSelector('#feeInfoBlockMinerFee')
      await page.evaluate((selector) => document.querySelector(selector).click(), '#slow')

      await timeOut(5 * 1000)

      await page.$('#sendButton').then((sendButton) => {
        if (sendButton) {
          sendButton.click()
        } else {
          throw new Error('Send button is not found')
        }
      })

      await page.waitForSelector('#txAmout', { timeout: 60 * 1000 })
      const btcTxAmout  = await page.$eval('#txAmout', el => el.textContent)

      await takeScreenshot(page, 'SendBTC_TxInfo')

      expect(btcTxAmout).toContain(amount.toString())

    } catch (error) {
      await takeScreenshot(page, 'SendBTCError')
      await browser.close()
      console.error('Send BTC error: ', error)
      expect(false).toBe(true)
    }

    await browser.close()

  })
})
