import puppeteer from 'puppeteer'

export const setup = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('file:///home/runner/work/MultiCurrencyWallet/MultiCurrencyWallet/build-testnet/index.html')

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

export const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    setup,
    importWallet,
    selectSendCurrency,
    timeOut
}