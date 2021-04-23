import { setup, importWallet, selectSendCurrency, timeOut } from './utils'

const SEED = ['vast', 'bronze', 'oyster', 'trade', 'love', 'once', 'fog', 'match', 'rail', 'lock', 'cake', 'science']
const btcAddress = 'mosm1NmQZETUQvH68C9kbS8F3nuVKD7RDk'
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

    await page.screenshot({
        path: `tests//e2e/screenshots/send_regular_${new Date().getTime()}.jpg`,
        type: 'jpeg'
    });

    await browser.close();
    expect(txAmount).toMatch(new RegExp(amount.toString()))
    expect(txToAddress).toBe(toAddress)

  })
})