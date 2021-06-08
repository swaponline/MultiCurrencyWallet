import puppeteer from 'puppeteer'
import BigNumber from 'bignumber.js'
import fs from 'fs'


const link = process.env.ACTIONS ? 'file:///home/runner/work/MultiCurrencyWallet/MultiCurrencyWallet/build-testnet/index.html' : 'http://localhost:9001/'

const isDebug = false

export const createBrowser = async (): Promise<{ browser: puppeteer.Browser, page: puppeteer.Page}> => {
  const browser = await puppeteer.launch({
    headless: !isDebug,
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

  await page.goto(link)

  return { browser, page }
}

type ImportWalletParams = {
  page: puppeteer.Page
  seed: string[]
  timeout?: number
}

export const importWallet = async (params: ImportWalletParams) => {
  const { page, seed, timeout = 30_000 } = params

  await page.waitForSelector('#preloaderRestoreBtn')
  await page.click('#preloaderRestoreBtn')

  await page.waitForSelector('.react-tags__search-input', {
    timeout,
  })

  const wordInput = await page.$(`.react-tags__search-input`)

  // remove default seed
    for (let i = 0; i < 12; i++) {
    await wordInput.press('Backspace')
  }

  // type seed
  for (let i = 0; i < 12; i++) {
    await wordInput.type(seed[i])
    await wordInput.press('Enter')
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

  await page.waitForSelector('#btcBalance') // waits for settings of mm to load

  // turn on MM
  const toggleSelector = 'input[type="checkbox"]'
  await page.evaluate((selector) => document.querySelector(selector).click(), toggleSelector);

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
  const dir = 'tests/e2e/screenshots'
  // check if ./screenshots directory exists
  if (!fs.existsSync(dir)) {
    // create tests/e2e/screenshots directory
    await fs.mkdir(dir, (err) => {
      if (err) {
          throw err;
      }
      console.log("tests/e2e/screenshots directory is created.")
    })
  }

  await page.screenshot({
    path: `tests/e2e/screenshots/${fileName}.jpg`,
    type: 'jpeg'
  })
}

export const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default {
  createBrowser,
  importWallet,
  selectSendCurrency,
  addAssetToWallet,
  turnOnMM,
  takeScreenshot,
  timeOut
}