import puppeteer from 'puppeteer'
import BigNumber from 'bignumber.js';

const link = process.env.ACTIONS ? 'file:///home/runner/work/MultiCurrencyWallet/MultiCurrencyWallet/build-testnet/index.html' : 'http://localhost:9001/'

export const setup = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(link)

  return { browser, page }
}

export const importWallet = async (page: puppeteer.Page, SEED: string[]) => {
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

export const selectSendCurrency = async (page: puppeteer.Page, currency: string = 'btc') => {
  await page.click('#sendBtn')
  await page.click('#currencyList')
  await page.click(`#${currency}Send`)
}

export const turnOnMM = async (page: puppeteer.Page) => {
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

  return {
    btcBalance,
    tokenBalance
  }
}

export const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    setup,
    importWallet,
    selectSendCurrency,
    turnOnMM,
    timeOut
}