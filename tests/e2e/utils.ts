import puppeteer from 'puppeteer'
import BigNumber from 'bignumber.js'


const link = process.env.ACTIONS ? 'file:///home/runner/work/MultiCurrencyWallet/MultiCurrencyWallet/build-testnet/index.html' : 'http://localhost:9001/'

const isDebug = false


export const createBrowser = async (): Promise<{ browser: puppeteer.browser, page: puppeteer.Page}> => {
  const browser = await puppeteer.launch({
    headless: isDebug,
    //slowMo: 100,
  })

  const page = await browser.newPage()
  await page.setViewport({
    width: 1100,
    height: 1080
  })

  page.on('error', err => {
    console.log('[puppeteer] error: ', err)
  })

  page.on('pageerror', err => {
    console.log('[puppeteer] pageerror: ', err)
  })

  await page.goto(link)

  return { browser, page }
}

export const importWallet = async (page: puppeteer.Page, SEED: string[]) => {

  await page.waitForSelector('#preloaderRestoreBtn')

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
}

export const selectSendCurrency = async (params) => {
  const { page, currency = 'btc', waitSelector = 30_000 } = params

  await page.waitForSelector('#sendBtn', { timeout: waitSelector })
  await page.click('#sendBtn')

  await page.waitForSelector('#withdrawCurrencyList', { timeout: waitSelector })
  await page.click('#withdrawCurrencyList')

  await page.click(`#${currency}Send`)
}

export const addAssetToWallet = async (page: puppeteer.Page, currency: string = 'wbtc') => {
  await page.click('#addAssetBtn')
  await page.click(`#${currency}Wallet`)
  await page.click('#continueBtn')
}

export const turnOnMM = async (page: puppeteer.Page) => {

  // turn on MM
  const toggleSelector = 'input[type="checkbox"]'
  await page.evaluate((selector) => document.querySelector(selector).click(), toggleSelector);

  await page.waitForSelector('#btcBalance') // waits for settings of mm to load

  // prepare balances for checking
  let btcBalance = await page.$eval('#btcBalance', el => el.textContent)
  let tokenBalance = await page.$eval('#tokenBalance', el => el.textContent)
  btcBalance = new BigNumber(btcBalance).toFixed(5)
  tokenBalance = new BigNumber(tokenBalance).toFixed(5)

  return {
    btcBalance,
    tokenBalance
  }
}

export const takeScreenshot = async (page: puppeteer.Page, fileName: string) => {
  await page.screenshot({
    path: `tests/e2e/screenshots/${fileName}.jpg`,
    type: 'jpeg'
  });
}

export const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  createBrowser,
  importWallet,
  selectSendCurrency,
  addAssetToWallet,
  turnOnMM,
  takeScreenshot,
  timeOut
}