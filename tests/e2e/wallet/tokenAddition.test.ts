import puppeteer from 'puppeteer'
import { createBrowser, addTokenToWallet, takeScreenshot, clickOn, timeOut } from '../utils'

jest.setTimeout(250 * 1000)

describe('Adding custom tokens', () => {
  let testBrowser: puppeteer.Browser | undefined
  let testPage: puppeteer.Page | undefined

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
        titleId: 'erc20weth',
        walletTitle: 'WETH ERC20',
      },
    ],
    [
      'Custom BSC BEP20',
      'bnbbep20',
      {
        contract: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
        titleId: 'bep20wbnb',
        walletTitle: 'WBNB BEP20',
      },
    ],
    [
      'Custom POLYGON ERC20',
      'maticerc20matic',
      {
        contract: '0x220afDcaE34D63EDe6ba68d9F50fFe5632d70a28',
        titleId: 'erc20maticmono',
        walletTitle: 'MONO ERC20MATIC',
      },
    ],
    [
      'Custom xDai ERC20',
      'xdaierc20xdai',
      {
        contract: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
        titleId: 'erc20xdaiaria',
        walletTitle: 'ARIA ERC20XDAI',
      },
    ],
    [
      'Custom Fantom ERC20',
      'ftmerc20ftm',
      {
        contract: '0xb4BF6a5695E311c49A8a5CebE7d9198c7454385a',
        titleId: 'erc20ftmwftm',
        walletTitle: 'WFTM ERC20FTM',
      },
    ],
    [
      'Custom Avalanche ERC20',
      'avaxerc20avax',
      {
        contract: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
        titleId: 'erc20avaxwavax',
        walletTitle: 'WAVAX ERC20AVAX',
      },
    ],
    [
      'Custom moonbase ERC20',
      'movrerc20movr',
      {
        contract: '0xA5fd1F6e7980Fd5cA9d062a762030D449990BBBf',
        titleId: 'erc20movrweth',
        walletTitle: 'WETH ERC20MOVR',
      },
    ],
    // their testnet is not working
    // [
    //   'Custom Harmony ERC20',
    //   'oneerc20one',
    //   {
    //     contract: '',
    //     titleId: '',
    //     walletTitle: '',
    //   },
    // ],
    // @todo fix token addition for Aurora betanet
    // [
    //   'Custom Aurora ERC20',
    //   'auretherc20aurora',
    //   {
    //     contract: '0x9D29f395524B3C817ed86e2987A14c1897aFF849',
    //     titleId: 'erc20auroraeth',
    //     walletTitle: 'WETH ERC20AURETH',
    //   },
    // ],
  ]

  async function checkTokenDisplay(params) {
    const { page, name, expectedTitle } = params

    const walletTitle = await page.$eval(`#${name}WalletTitle`, (el) => el.textContent)

    if (walletTitle !== expectedTitle) {
      throw new Error(`incorrect display for ${name.toUpperCase()} type`)
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
          page: testPage,
          selector: `#ethWallet`,
        })
        await clickOn({
          page: testPage,
          selector: '#continueBtn',
        })
      } catch (error) {
        console.error(error)
        await takeScreenshot(testPage, `AddingWalletError_eth`)
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

        await addTokenToWallet({
          page: testPage,
          standardId: typeId,
          contract,
        })

        await testPage.waitForSelector(`#${titleId}WalletTitle`)

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
