import { setup, importWallet, selectSendCurrency, timeOut } from './utils'

const SEED = ['vast', 'bronze', 'oyster', 'trade', 'love', 'once', 'fog', 'match', 'rail', 'lock', 'cake', 'science']
const btcAddress = 'mosm1NmQZETUQvH68C9kbS8F3nuVKD7RDk'

jest.setTimeout(80 * 1000)

describe('Try MM', () => {
  it('from browser', async () => {
    const { browser, page } = await setup()

    await importWallet(page, SEED)

    await page.waitForSelector('#btcAddress') // waits for wallet to load

    const earnPage = await page.$('a[href="#/marketmaker"]')
    await earnPage.click()

    const [tryMMInBrowserBtn] = await page.$x("//button[contains(., 'Начать в браузере')]");
    if (tryMMInBrowserBtn) {
        await tryMMInBrowserBtn.click();
    }

    // timeOut(5 * 1000)
    await page.waitForSelector('#btcBalance') // waits for settings of mm to load
    const btcBalance = await page.$eval('#btcBalance', el => el.textContent)
    const tokenBalance = await page.$eval('#tokenBalance', el => el.textContent)
    console.log('btcBalance', btcBalance)
    console.log('tokenBalance', tokenBalance)

    try {
      const toggleSelector = 'input[type="checkbox"]'
      await page.evaluate((selector) => document.querySelector(selector).click(), toggleSelector);

      const exchangePage = await page.$('a[href="#/exchange"]')
      await exchangePage.click()

      timeOut(5 * 1000)

      await page.screenshot({
        path: `tests//e2e/screenshots/earn_${new Date().getTime()}.jpg`,
        type: 'jpeg'
      })
    } catch (error) {
      console.log(error)
      await browser.close()
    }

    await browser.close()

  })
})