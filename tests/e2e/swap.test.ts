import { setup, importWallet, turnOnMM, takeScreenshot, timeOut } from './utils'

const MAKER_SEED = ['vast', 'bronze', 'oyster', 'trade', 'love', 'once', 'fog', 'match', 'rail', 'lock', 'cake', 'science']
const makerBtcAddress = 'mosm1NmQZETUQvH68C9kbS8F3nuVKD7RDk'

const TAKER_SEED = ['honey', 'stereo', 'harsh', 'diary', 'select', 'episode', 'ready', 'ritual', 'best', 'target', 'paper', 'auto']
const takerBtcAddress = 'n4JjB9D9axszdsFxyxDmF43z4WwttN6oPb'

jest.setTimeout(100 * 1000)

describe('Try swap', () => {
  it('turn on MM', async () => {
    const { browser: MakerBrowser, page: MakerPage } = await setup()
    const { browser: TakerBrowser, page: TakerPage } = await setup()

    await importWallet(MakerPage, MAKER_SEED)
    await importWallet(TakerPage, TAKER_SEED)

    await MakerPage.waitForSelector('#btcAddress') // waits for Maker wallet to load
    await TakerPage.waitForSelector('#btcAddress') // waits for Taker wallet to load
    await turnOnMM(MakerPage)

    await timeOut(2 * 1000)

    try {
      // move to exchange page
      const takerExchangePageLink = await TakerPage.$('a[href="#/exchange"]')
      await takerExchangePageLink.click()

      await timeOut(2 * 1000)

      const [sellCurrencySelectorList, sellWalletSelectorList, buyCurrencySelectorList, buyWalletSelectorList] = await TakerPage.$$('.itemsSelector')

      await buyCurrencySelectorList.click();
      await TakerPage.click(`#wbtc`)

      await timeOut(10 * 1000)

      await takeScreenshot(MakerPage, 'Maker_Page_Wallet')
      await takeScreenshot(TakerPage, 'Taker_Page_Wallet')
    } catch (error) {
      console.log('Error: ', error)
      await MakerBrowser.close()
      await TakerBrowser.close()
    }


    await MakerBrowser.close()
    await TakerBrowser.close()

  })

})