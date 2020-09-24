import SwapApp, { SwapInterface } from 'swap.app'
import { Bitcoin } from 'examples/react/src/instances/bitcoin'
import bitcoin from 'bitcoinjs-lib'
import Swap from 'swap.swap'
import { USDT2ETHTOKEN, ETHTOKEN2USDT } from 'swap.flows'
import { UsdtSwap, EthTokenSwap } from 'swap.swaps'
import fixtures from './fixtures'

jest.mock('swap.app')
jest.unmock('swap.flows')
jest.unmock('swap.swaps')

const app = SwapApp.shared()

const log = console.log

const utcNow = () => Math.floor(Date.now() / 1000)
const getLockTime = () => utcNow() + 3600 * 1 // 1 hour from now

const secret      = 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078'
const secretHash  = 'c0933f9be51a284acb6b1a6617a48d795bdeaa80'
const lockTime    = 1534783820 //getLockTime()


const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// const usdtOwner = {
//   privateKey: 'cRkKzpir8GneA48iQVjSpUGT5mopFRTGDES7Kb43JduzrbhuVncn',
//   publicKey: '02b65eed68f383178ee4bf301d1a2d231194eba2a65969187d49a6cdd945ea4f9d',
// }
//
// const ethOwner = {
//   privateKey: 'cT5n9yx1xw3TcbvpEAuXvzhrTb5du4RAYbAbTqHfZ9nbq6gJQMGn',
//   publicKey: '02dfae561eb061072da126f1aed7d47202a36b762e89e913c400cdb682360d9620',
// }

const _funding_tx_hex =
  '0100000004c47ed7c8420d5da5687999dd09ca2131043dfdf304fe54ba0b4c498cf56b0d97020000006a47304402204a11d1f6bf380b7a534054c84b182d477b108f54383eaa003991527f6081019d02205336d791580fbae3173bd4377bb7afa39b788a51fdffa6d91b5fc60dcd24fa5301210386fbd9bd29d36e07dff34bc09173fb3035fb418ffbcc13c6d06334c1ff2e5422fefffffff08af1e312fe07caff1078c26c7657235beefa172ccd8e6e379a4fecb19857d2000000006a4730440220535007887a672a81c9c8aec1a5b5dbb41f989d8da'
+ '766820302636efbad540f4302202f2c35be1d9332680f7094a18eeb321c093c9c550c163e841f2d2b993181daba01210386fbd9bd29d36e07dff34bc09173fb3035fb418ffbcc13c6d06334c1ff2e5422feffffffadc35fe637d09c2e6f9bf95ef92dbf62f26baaabda127690821792b5cfcb7b55010000006a473044022020c8ccfe1c4ea3bd95cd9ec105b45f8ed9f51934ae1a9e7c0d1eb5a604a35e2002203e3cb0189ab3e2831fe6d8d579be58779053b6b1f444d96cc34d78f3aa03cabc01210386fbd9bd29d36e07dff34bc09173fb3035fb41'
+ '8ffbcc13c6d06334c1ff2e5422feffffffadc35fe637d09c2e6f9bf95ef92dbf62f26baaabda127690821792b5cfcb7b55000000006a473044022028f36f3e88824e8099f90997d4f6145f16753a88444477c485e8a0f01a807d9002203c459bbdb94b841719d607663313d8c2f26e94c133db31ea4e860d6637dc852801210386fbd9bd29d36e07dff34bc09173fb3035fb418ffbcc13c6d06334c1ff2e5422feffffff02220200000000000017a914aafc12a55043bcf1080a00d79447235c16364edf8711e5c907000000001976a914cca29a04447'
+ '71a6a36c012523c4bfd70333eb55088ac00000000'

const _ORDER = {
  'id': 'Qm-1231231',
  'buyCurrency': 'SWAP',
  'sellCurrency': 'USDT',
  'buyAmount': '3',
  'sellAmount': '5',
  'exchangeRate': '1.66',

  'owner': {
    peer: 'Qmaaa',
    eth: { address: '0xfafafafafafafafafafafafafafafafafafafafa' },
    btc: { address: '1Kf1dtmZGUoy482yXeoUuhfAJVKyD9JpWS', publicKey: '0386fbd9bd29d36e07dff34bc09173fb3035fb418ffbcc13c6d06334c1ff2e5422' },
  },
  'participant': {
    peer: 'Qmbbb',
    eth: { address: '0xdadadadadadadadadadadadadadadadadadadada' },
    btc: { address: '1PdhGkf1spScMZtkAFGUaE7q7mX2X71Rr5', publicKey: '033a117cc4d164984c1e8fb58f39f08a17a2e615d77d8f7a35a7d9cdeb9e93ef4c' },
  },

  'requests': [],
  'isRequested': true,
  'isProcessing': true,
  'destination': {},
}

beforeAll(() => {
  app.flows['USDT2SWAP'] = USDT2ETHTOKEN('SWAP')
  app.flows['SWAP2USDT'] = ETHTOKEN2USDT('SWAP')

  app.swaps['SWAP'] = new EthTokenSwap({
    name: 'SWAP',
    fetchBalance: jest.fn(address => 50),
    address: '0xABABABABABABABABABABABABABA',
    abi: [],
    tokenAddress: '0x5111AFDacdac',
    tokenAbi: [],
    decimals: 18,
  })

  app.swaps['USDT'] = new UsdtSwap({
    fetchBalance: jest.fn(address => 100),
    fetchUnspents: jest.fn(address => fixtures.unspents.filter(u => u.address == address)),
    broadcastTx: jest.fn(tx => Promise.resolve()),
    fetchTx: jest.fn(),
  })

  app.swaps['USDT'].checkScript = () => {}

  app.swaps['SWAP']._initSwap(app)
  app.swaps['USDT']._initSwap(app)
})

test('create swap', () => {
  const swap = new Swap("Qm-1231231", app, _ORDER)

  expect(swap.flow.state.step).toBe(0)

  expect(swap.flow._flowName).toEqual("SWAP2USDT")
})

describe('full flow', () => {
  let swap
  const _roomId = { fromPeer: 'Qmbbb', swapId: 'Qm-1231231' }
  const _messageForEvent = (event, payload) => [ "Qmbbb", { action: 'active', data: { swapId: 'Qm-1231231' }, event } ]

  beforeAll(() => {
    swap = new Swap("Qm-1231231", app, _ORDER)
  })

  test('answers to request sign', async () => {
    await timeout(100)
    expect(swap.flow.state.step).toEqual(1)

    swap.flow.sign()

    app.services.room.emit('request sign', _roomId)
    // app.services.room.emit('confirmation', _confirmationForEvent('request sign'))


    await timeout(100)

    expect(app.services.room.sendConfirmation).toHaveBeenCalled()
    expect(app.services.room.sendConfirmation.mock.calls[0]).toEqual(_messageForEvent('swap sign'))
    expect(app.services.room.sendConfirmation.mock.calls[1]).toEqual(_messageForEvent('request btc script'))
  })

  test('saves script values', async () => {
    await timeout(100)

    const scriptValues = {
      secretHash,
      lockTime,
      ownerPublicKey:     _ORDER.owner.btc.publicKey,
      recipientPublicKey: _ORDER.participant.btc.publicKey,
    }

    const usdtFundingTransactionHash = '61d9978ed5cd81f49f56d3b6bab2304c74462c4f4a66a5dd02df4458ca009278'
    const usdtRawRedeemTransactionHex = '0100000002789200ca5844df02dda5664a4f2c46744c30b2bab6d3569ff481cdd58e97d961010000006a4730440220080ea7496fa1148194c85ea63d755502fb32d610d4611ea8acf8a0ae960f87d902203f4e021e3ef04c10d30c2dfeb5a55251845fc21e1916e7385fe7999b0d0c602c01210386fbd9bd29d36e07dff34bc09173fb3035fb418ffbcc13c6d06334c1ff2e5422ffffffff789200ca5844df02dda5664a4f2c46744c30b2bab6d3569ff481cdd58e97d9610000000000ffffffff030000000000000000166a146f6d6e69000000000000001f000000001dcd650022020000000000001976a914f8435be12ad3dc98226581fcfde21912e9d9301c88ac4c3e0000000000001976a914cca29a0444771a6a36c012523c4bfd70333eb55088ac00000000'
//
// $ node alice.js
// ali wif KwMUy5TKPK51UTF7MFZWtdkWe4DV1uWQVcSc9Jz6g51MCn8jTSQd
// bob wif L5XCznWF1g7zyoSvk3deyi7wRvNc3L6okFrYqj7gfh6Qz3hJvuub
// ali addr 1Kf1dtmZGUoy482yXeoUuhfAJVKyD9JpWS
// bob addr 1PdhGkf1spScMZtkAFGUaE7q7mX2X71Rr5
// ali key 0386fbd9bd29d36e07dff34bc09173fb3035fb418ffbcc13c6d06334c1ff2e5422
// bob key 033a117cc4d164984c1e8fb58f39f08a17a2e615d77d8f7a35a7d9cdeb9e93ef4c
// GET https://insight.bitpay.com/api/addr/1Kf1dtmZGUoy482yXeoUuhfAJVKyD9JpWS/utxo/
//
// <Buffer a6 14 23 cc 3d 12 5c a6 61 77 a2 cb 50 9f 1f 5f f5 a2 d5 a8 2f 59 88 21 03 3a 11 7c c4 d1 64 98 4c 1e 8f b5 8f 39 f0 8a 17 a2 e6 15 d7 7d8f 7a 35 a7 ... >
// funding tx hash 61d9978ed5cd81f49f56d3b6bab2304c74462c4f4a66a5dd02df4458ca009278
// funding tx hex 010000000139aac95d6f2031612e7df484eddfeaff55f7aeac8f39fcfed43049cf2ac403f5010000006b483045022100ecb4ff28d8e46d469fbaa8b51ba9abfd41559e13458758e550512325649154ff022005868c7c583ef6ead15fb6aa418c5b6b98efd130a64da9a9769e7af9bd3406b401210386fbd9bd29d36e07dff34bc09173fb3035fb418ffbcc13c6d06334c1ff2e5422feffffff02220200000000000017a914a10943bd419f272564f0d1932a13b248193afa03870e500000000000001976a914cca29a0444771a6a36c012523c4bfd70333eb55088ac00000000
// script 38VoPwngdHpuLeJqAHrnH8V4FtYCrHZ6UE
// GET https://insight.bitpay.com/api/addr/1Kf1dtmZGUoy482yXeoUuhfAJVKyD9JpWS/utxo/
// GET https://insight.bitpay.com/api/addr/38VoPwngdHpuLeJqAHrnH8V4FtYCrHZ6UE/utxo/
// redeem hex

    app.services.room.emit('create btc script', {
      scriptValues, usdtFundingTransactionHash,
      usdtRawRedeemTransactionHex,
      ..._roomId })

    expect(swap.flow.state.usdtScriptValues).toBeTruthy()
    expect(swap.flow.state.usdtScriptValues).toEqual(scriptValues)
  })

  test('lock ETH', async () => {
    swap.flow.verifyBtcScript()

    expect(swap.flow.state.step).toEqual(4)

    await timeout(100)

    expect(app.services.room.sendConfirmation.mock.calls[2]).toEqual(_messageForEvent('create eth contract'))

    // expect(app.services.room.sendMessage.mock.calls[2]).toEqual(_messageForEvent('create eth contract'))

    // expect(app.services.room.sendMessage).toHaveBeenCalled()

    swap.flow.ethTokenSwap.contract.methods.createSwap().emitter.emit('transactionHash', 'asdfghjkl')

    // await timeout(0)

    expect(swap.flow.state.ethSwapCreationTransactionHash).toBe('asdfghjkl')
  })

  test('withdraws USDT', async () => {
    expect(swap.flow.state.step).toBe(6)

    swap.flow.ethTokenSwap.contract.state.secret = secret

    await timeout(100)
    expect(swap.flow.state.step).toBe(6)

    app.services.room.emit('finish eth withdraw', _roomId)

    await timeout(100)
    expect(swap.flow.state.step).toBe(9)
    expect(swap.flow.state.isEthWithdrawn).toBe(true)
    expect(swap.flow.state.isBtcWithdrawn).toBe(true)
  })

})
