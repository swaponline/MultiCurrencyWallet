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

let app = SwapApp

const log = console.log

const secret      = 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078'
const secretHash  = 'c0933f9be51a284acb6b1a6617a48d795bdeaa80'
const lockTime    = 1521171580

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
  'buyCurrency': 'USDT',
  'sellCurrency': 'SWAP',
  'buyAmount': '1',
  'sellAmount': '2',
  'exchangeRate': '0.5',

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
    fetchBalance: jest.fn(),
    decimals: 18,
    address: '0xABABABABABABABABABABABABABA',
    abi: [],
    tokenAddress: '0x5111AFDacdac',
    tokenAbi: [],
    decimals: 18,
  })

  app.swaps['USDT'] = new UsdtSwap({
    fetchBalance: jest.fn(address => 100),
    fetchUnspents: jest.fn(address => fixtures.unspents),
    broadcastTx: jest.fn(),
    fetchTx: jest.fn(),
  })

  app.swaps['SWAP']._initSwap(app)
  app.swaps['USDT']._initSwap(app)
})

test('create swap', () => {
  const swap = new Swap("Qm-1231231", app, _ORDER)

  expect(swap.flow.state.step).toBe(0)
})

describe('full flow', () => {
  let swap
  const _roomId = { fromPeer: 'Qmbbb', swapId: 'Qm-1231231' }
  beforeAll(() => {
    swap = new Swap("Qm-1231231", app, _ORDER)
  })

  test('gets message sign swap', async () => {
    await timeout(100)
    expect(swap.flow.state.step).toBe(1)

    app.services.room.emit('swap sign', _roomId)

    await timeout(500)
    expect(swap.flow.state.step).toBe(2)

    await timeout(500)
    expect(swap.flow.state.isParticipantSigned).toBe(true)
  })

  test('saves secret', async () => {
    swap.flow.submitSecret(secret)

    expect(swap.flow.state.secret).toBeTruthy()
    expect(swap.flow.state.secret).toEqual(secret)
  })

  test('tried to fetch balance', async () => {
    expect(app.swaps['USDT'].fetchBalance).toHaveBeenCalled()
    expect(app.swaps['USDT'].fetchUnspents).toHaveBeenCalledWith('1Kf1dtmZGUoy482yXeoUuhfAJVKyD9JpWS')
  })

  test('locks atomic swap script', async () => {
    await timeout(1000)
    expect(app.swaps['USDT'].broadcastTx).toHaveBeenCalled()
    // expect(app.swaps['USDT'].fetchUnspents).toHaveBeenCalledWith('3KmDaeEb6xnkiVhZd5w7uPwm7KBFzdiGQp')
    expect(app.swaps['USDT'].fetchUnspents).toHaveBeenCalledWith('1Kf1dtmZGUoy482yXeoUuhfAJVKyD9JpWS')
    // decode broadcasted tx and check
  })

  xtest('does not withdraw ETH when swap doesnt exist', async () => {
    swap.flow.ethTokenSwap.contract.state.swapExists = false

    app.services.room.emit('create eth contract', { ethSwapCreationTransactionHash: '555abcdef333', ..._roomId })

    await timeout(100)

    expect(swap.flow.ethTokenSwap.contract.methods.withdraw).not.toHaveBeenCalled()

  })

  xtest('withdraws ETH if balance is locked', async () => {
    swap.flow.ethTokenSwap.contract.state.swapExists = true

    swap.flow.steps[6]() // not for production use
    app.services.room.emit('create eth contract', { ethSwapCreationTransactionHash: '555abcdef333', ..._roomId })

    await timeout(100)

    expect(swap.flow.ethTokenSwap.contract.methods.withdraw).toHaveBeenCalled()
    expect(swap.flow.ethTokenSwap.contract.methods.withdraw)
      .toHaveBeenCalledWith(`0x${secret}`, _ORDER.participant.eth.address)

    swap.flow.ethTokenSwap.contract.methods.withdraw().emitter.emit('transactionHash', '0xaaabbbbddd')

    await timeout(100)

    expect(swap.flow.state.ethSwapWithdrawTransactionHash).toEqual('0xaaabbbbddd')
  })
})
