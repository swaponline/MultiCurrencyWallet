import { setup, importWallet, timeOut } from './utils'
import BigNumber from 'bignumber.js';

const SEED = ['vast', 'bronze', 'oyster', 'trade', 'love', 'once', 'fog', 'match', 'rail', 'lock', 'cake', 'science']
const btcAddress = 'mosm1NmQZETUQvH68C9kbS8F3nuVKD7RDk'

jest.setTimeout(50 * 1000)

describe('Try MM', () => {
  it('from browser', async () => {
    const { browser, page } = await setup()

    await importWallet(page, SEED)

    await page.waitForSelector('#btcAddress') // waits for wallet to load

    // move to earn page
    const earnPage = await page.$('a[href="#/marketmaker"]')
    await earnPage.click()

    // choose try MM in browser
    const [tryMMInBrowserBtn] = await page.$x("//button[contains(., 'Начать в браузере')]");
    if (tryMMInBrowserBtn) {
        await tryMMInBrowserBtn.click();
    }

    await page.waitForSelector('#btcBalance') // waits for settings of mm to load

    // prepare balances for checking
    let btcBalance = await page.$eval('#btcBalance', el => el.textContent)
    let tokenBalance = await page.$eval('#tokenBalance', el => el.textContent)
    btcBalance = new BigNumber(btcBalance).toFixed(5)
    tokenBalance = new BigNumber(tokenBalance).toFixed(5)

    // turn on MM
    const toggleSelector = 'input[type="checkbox"]'
    await page.evaluate((selector) => document.querySelector(selector).click(), toggleSelector);

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