import { setup, importWallet } from './utils'

const SEED = ['express', 'pretty', 'dinner', 'first', 'someone', 'reform', 'occur', 'food', 'dice', 'very', 'thumb', 'unfold']
const btcAddress = 'n1AqFLX43FFK5dyzXkxjt6AXKLZ1TCniWw'

jest.setTimeout(50 * 1000)

describe('Restore wallet', () => {
  it('from 12 words and check recovered BTC address', async () => {
    const { browser, page } = await setup()
    await importWallet(page, SEED)

    await page.waitForSelector('#btcAddress')

    const recoveredBtcAddress = await page.$eval('#btcAddress', el => el.textContent)

    await browser.close();

    expect(btcAddress).toBe(recoveredBtcAddress)
  })
})