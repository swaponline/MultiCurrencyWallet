/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer'
import BigNumber from 'bignumber.js'
import fs from 'fs'
import TestWallets from '../testWallets.json'

export const testWallets = TestWallets

let link = 'http://localhost:9001/'

if (process.env.ACTIONS) {
  link = `file:///home/runner/work/MultiCurrencyWallet/MultiCurrencyWallet/build-${
    process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
  }/index.html`
}

console.log('>>>> START TEST', process.env.NODE_ENV)
// if it's true then you will be able to see puppeteer's browser
// don't enable this mode in Github test flows. They don't work with that
const isDebug = false

export const createBrowser = async (): Promise<{
  browser: puppeteer.Browser
  page: puppeteer.Page
}> => {
  const browser = await puppeteer.launch({
    headless: !isDebug,
    // slowMo: 100,
  })

  const page = await browser.newPage()
  await page.setViewport({
    width: 1100,
    height: 1080,
  })

  page.on('error', (err) => {
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

export const waitSlowLoadSelector = async (page, selector, timeout, throwCount) => {
  if (throwCount === 0) return false
  try {
    let element = await page.waitForSelector(selector, {
      timeout,
    })
    if (element !== null) {
      return true
    }
  } catch (e) { }

  return await waitSlowLoadSelector(page, selector, timeout, throwCount-1)
}

export const importWallet = async (params: ImportWalletParams) => {
  const { page, seed, timeout = 30_000 } = params

  await clickOn({
    page,
    selector: '#preloaderRestoreBtn',
  })
  // app creation
  await timeOut(30_000)

  await page.click('#restoreWalletUseMnemonic')

  await page.waitForSelector('.react-tags__search-input', {
    timeout,
  })

  const wordInput: puppeteer.ElementHandle | null = await page.$(`.react-tags__search-input`)

  if (!wordInput) {
    throw new Error('HTML input for the Mnemonic phrase is not found')
  }

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

  const isRecovered = await waitSlowLoadSelector(page, '#finishWalletRecoveryButton', timeout, 20)
  if (!isRecovered) {
    throw new Error('Recovery timeout')
  }

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

export const addAssetToWallet = async (page: puppeteer.Page, currency = 'ethwbtc') => {
  try {
    await clickOn({
      page,
      selector: '#addAssetBtn',
    })
    await clickOn({
      page,
      selector: `#${currency}Wallet`,
    })
    await clickOn({
      page,
      selector: '#continueBtn',
    })
  } catch (error) {
    throw new Error(error)
  }
}

export const addTokenToWallet = async (params) => {
  const { page, standardId, contract } = params
  try {
    await addAssetToWallet(page, standardId)

    const addressInput = await page.$('#customTokenInput')
    await addressInput.type(contract)

    await clickOn({
      page,
      selector: '#customTokenNextButton',
    })

    const isTokenFetched = await waitSlowLoadSelector(page, `#customTokenAddButton`, 60_000, 20)
    if (!isTokenFetched) {
      throw new Error('Add token fetch timeout')
    }

    await clickOn({
      page,
      selector: '#customTokenAddButton',
    })
    await clickOn({
      page,
      selector: '#customTokenDoneButton',
    })
  } catch (error) {
    throw new Error(error)
  }
}

export const turnOnMM = async (page: puppeteer.Page) => {
  try {
    await page.waitForSelector('#btcBalance') // waits for settings of mm to load

    // turn on MM
    const toggleSelector = 'input[type="checkbox"]'
    await page.evaluate((selector) => document.querySelector(selector).click(), toggleSelector)

    // prepare balances for checking
    let btcBalance: string | null = await page.$eval('#btcBalance', (el) => el.textContent)
    let tokenBalance: string | null = await page.$eval('#tokenBalance', (el) => el.textContent)

    if (!btcBalance || !tokenBalance) {
      throw new Error('BTC or Token balances are not found')
    }

    btcBalance = new BigNumber(btcBalance).toFixed(5)
    tokenBalance = new BigNumber(tokenBalance).toFixed(5)

    return {
      btcBalance,
      tokenBalance,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const clickOn = async (params) => {
  const { page, selector } = params

  await page.$(selector).then(async (item) => {
    if (item) {
      item.click()
      await timeOut(1000)
    } else {
      throw new Error(`Selector (${selector}) is not found`)
    }
  })
}

export const takeScreenshot = async (page: puppeteer.Page, fileName: string) => {
  const dir = 'tests/e2e/screenshots'
  // check if ./screenshots directory exists
  if (!fs.existsSync(dir)) {
    // create tests/e2e/screenshots directory
    await fs.mkdir(dir, (err) => {
      if (err) {
        throw err
      }
      console.log('tests/e2e/screenshots directory is created.')
    })
  }

  await page.screenshot({
    path: `tests/e2e/screenshots/${fileName}.jpg`,
    type: 'jpeg',
  })
}

export const timeOut = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  testWallets,
  createBrowser,
  importWallet,
  selectSendCurrency,
  addAssetToWallet,
  addTokenToWallet,
  turnOnMM,
  takeScreenshot,
  timeOut,
  waitSlowLoadSelector,
}
