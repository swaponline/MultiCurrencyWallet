import puppeteer from 'puppeteer'
import { createBrowser, addAssetToWallet, takeScreenshot, clickOn, timeOut } from '../utils'

jest.setTimeout(250 * 1000)

describe('Adding custom tokens', () => {
  let testBrowser: puppeteer.Browser | undefined = undefined
  let testPage: puppeteer.Page | undefined = undefined

  type TestCase = [
    string,
    string,
    {
      contract: string
      titleId: string
      walletTitle: string
    }
  ]

  const cases: TestCase[] = [
    [
      'Custom ETH ERC20',
      'etherc20',
      {
        contract: '0xc778417e063141139fce010982780140aa0cd5ab',
        titleId: 'erc20wethWalletTitle',
        walletTitle: 'WETHERC20',
      },
    ],
    [
      'Custom BSC BEP20',
      'bnbbep20',
      {
        contract: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
        titleId: 'bep20wbnbWalletTitle',
        walletTitle: 'WBNB BEP20',
      },
    ],
    [
      'Custom POLYGON BEP20',
      'maticerc20matic',
      {
        contract: '0x220afDcaE34D63EDe6ba68d9F50fFe5632d70a28',
        titleId: 'erc20maticmonoWalletTitle',
        walletTitle: 'MONOERC20MATIC',
      },
    ],
  ]

  async function checkTokenDisplay(params) {
    const { page, name, expectedTitle } = params

    const walletTitle = await page.$eval(`#${name}WalletTitle`, (el) => el.textContent)

    if (walletTitle !== expectedTitle) {
      throw new Error(`incorrect display for ${name.toUpperCase()} wallet`)
    }
  }

  beforeAll(async () => {
    const { browser, page } = await createBrowser()

    testBrowser = browser
    testPage = page

    await page.waitForSelector('#preloaderCreateBtn')
    await page.click('#preloaderCreateBtn')

    await timeOut(60_000)
  })

  afterAll(async () => {
    await testBrowser?.close()
  })

  // add some coin on first load
  // it lets to write less code for token tests
  it('adding ETH', async () => {
    if (testPage) {
      try {
        await clickOn({
          testPage,
          selector: `#ethWallet`,
        })
        await clickOn({
          testPage,
          selector: '#continueBtn',
        })
      } catch (error) {
        console.error(error)
        await takeScreenshot(testPage, `AddingWalletError_${'etherc20'}`)
        expect(false).toBe(true)
      }
    } else {
      throw new Error('page is not found')
    }
  })

  it.each(cases)('adding %s', async (name, typeId, options) => {
    if (testPage) {
      try {
        const { contract, titleId, walletTitle } = options

        await addAssetToWallet(testPage, typeId)

        const addressInput: puppeteer.ElementHandle | null = await testPage.$('#customTokenInput')

        if (addressInput) {
          await addressInput.type(contract)
        }

        await clickOn({
          testPage,
          selector: '#customTokenNextButton',
        })
        await clickOn({
          testPage,
          selector: '#customTokenAddButton',
        })
        await clickOn({
          testPage,
          selector: '#customTokenDoneButton',
        })

        // await timeOut(60_000)
        await testPage.waitForNavigation()

        await checkTokenDisplay({
          page: testPage,
          name: titleId,
          expectedTitle: walletTitle,
        })
      } catch (error) {
        console.error(error)
        await takeScreenshot(testPage, `AddingWalletError_${typeId}`)
        expect(false).toBe(true)
      }
    } else {
      throw new Error('page is not found')
    }
  })
})
