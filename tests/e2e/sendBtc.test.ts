import { setup, importWallet, selectSendCurrency, timeOut } from './utils'

const SEED = ['neither', 'already', 'situate', 'silent', 'ripple', 'milk', 'paddle', 'glass', 'leopard', 'track', 'mansion', 'junk']
const btcAddress = 'n2Y2rbg6wVEQnnpNxisiHK4wCDUAq59iv6'
const toAddress = 'n4JjB9D9axszdsFxyxDmF43z4WwttN6oPb'
const amount = 5_000e-8

jest.setTimeout(80 * 1000)

describe('Send BTC', () => {
  it('from regular wallet', async () => {
    const { browser, page } = await setup()

    await importWallet(page, SEED)

    await page.waitForSelector('#btcAddress')

    await selectSendCurrency(page, 'btc')

    await page.type('#toAddressInput', toAddress)
    await page.type('#amountInput', amount.toString())

    await timeOut(5 * 1000)

    await page.click('#sendButton')

    await page.waitForSelector('#txAmout')

    const txAmount = await page.$eval('#txAmout', el => el.textContent)
    const txToAddress = await page.$eval('#txToAddress', el => el.textContent)

    await browser.close();
    expect(txAmount).toMatch(new RegExp(amount.toString()))
    expect(txToAddress).toBe(toAddress)

  })
})