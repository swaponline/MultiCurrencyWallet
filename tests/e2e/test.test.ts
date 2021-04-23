import puppeteer from 'puppeteer'

const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SEED = ['express', 'pretty', 'dinner', 'first', 'someone', 'reform', 'occur', 'food', 'dice', 'very', 'thumb', 'unfold']
const btcAddress = 'n1AqFLX43FFK5dyzXkxjt6AXKLZ1TCniWw'

jest.setTimeout(50 * 1000)

describe('Restpore wallet', () => {
  it('from 12 words and check recovery BTC address', async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:9001/')

    await page.click('#preloaderRestoreBtn')

    await page.waitForSelector('.react-tags__search-input')

    const wordInput = await page.$(`.react-tags__search-input`)

    // remove default seed
    for (let i = 0; i < 12; i++) {
      await wordInput.press('Backspace');
    }

    // type seed
    for (let i = 0; i < 12; i++) {
      await wordInput.type(SEED[i])
      await wordInput.press('Enter');
    }

    await page.click('#walletRecoveryButton')

    await page.click('#finishWalletRecoveryButton')

    await page.waitForSelector('#btcAddress')

    const recoveredBtcAddress = await page.$eval('#btcAddress', el => el.textContent)

    await page.screenshot({
        path: `tests//e2e/screenshots/restore_${new Date().getTime().toString()}.jpg`,
        type: 'jpeg'
    });

    await browser.close();

    expect(btcAddress).toBe(recoveredBtcAddress)
  })
})