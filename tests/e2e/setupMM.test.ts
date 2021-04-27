import { setup, importWallet, turnOnMM, timeOut } from './utils'

const SEED = ['vast', 'bronze', 'oyster', 'trade', 'love', 'once', 'fog', 'match', 'rail', 'lock', 'cake', 'science']
const btcAddress = 'mosm1NmQZETUQvH68C9kbS8F3nuVKD7RDk'

jest.setTimeout(50 * 1000)

describe('Try MM', () => {
  it('from browser', async () => {
    const { browser, page } = await setup()

    await importWallet(page, SEED)

    await page.waitForSelector('#btcAddress') // waits for wallet to load

    const { btcBalance, tokenBalance } = await turnOnMM(page)

    // move to exchange page
    const exchangePage = await page.$('a[href="#/exchange"]')
    await exchangePage.click()

    timeOut(10 * 1000)

    // find all your offers and get orders numbers
    const sellAmountOrders  = await page.$$eval('.sellAmountOrders', elements => elements.map(el => el.textContent))
    const buyAmountOrders   = await page.$$eval('.buyAmountOrders', elements => elements.map(el => el.textContent))
    const orders = [...sellAmountOrders, ...buyAmountOrders]

    expect(orders).toContain(btcBalance);
    expect(orders).toContain(tokenBalance);

    await browser.close()

  })
})