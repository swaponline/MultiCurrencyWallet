import { networks as bitcoinNetworks } from '../instances/bitcoin'
import { networks as ethereumNetworks} from '../instances/ethereum'
import { default as tokenSwap } from './tokenSwap'

const bitcoin = bitcoinNetworks.testnet()
const ethereum = ethereumNetworks.testnet()

const id = parseInt(process.argv[2])
        || process.env.SERVER_ID
        || process.env.ACCOUNT
        || Math.random().toString().slice(2)

const offset = process.env.OFFSET || process.argv[1]
const ROOT_DIR = process.env.ROOT_DIR || '.'

const config = {
  id,
  network: 'testnet',
  storageDir: `${ROOT_DIR}/.storage/__testnet__${id}__`,
  swapRoom: {
    roomName: 'testnet.swap.online',
  },
  ethSwap: () => ({
    gasLimit: 2e5,
    address: '0x6F54CDAE7c98b0306fB3aB4daED4cAEe25b92Bc6',
    abi: [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"participantSigns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"participantAddress","type":"address"}],"name":"withdrawNoMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"},{"name":"_targetWallet","type":"address"}],"name":"createSwapTarget","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"swaps","outputs":[{"name":"targetWallet","type":"address"},{"name":"secret","type":"bytes32"},{"name":"secretHash","type":"bytes20"},{"name":"createdAt","type":"uint256"},{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ownerAddress","type":"address"},{"name":"_participantAddress","type":"address"}],"name":"closeSwapByAdminAfterOneYear","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"}],"name":"createSwap","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"},{"name":"participantAddress","type":"address"}],"name":"withdrawOther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ratingContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getTargetWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_secretHash","type":"bytes20"},{"indexed":false,"name":"createdAt","type":"uint256"}],"name":"CreateSwap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"_secretHash","type":"bytes20"},{"indexed":false,"name":"withdrawnAt","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"}],"name":"Close","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"_secretHash","type":"bytes20"}],"name":"Refund","type":"event"}],
    fetchBalance: (address) => ethereum.fetchBalance(address),
    estimateGasPrice: ({ speed }) => ethereum.estimateGasPrice({ speed }),
  }),
  btcSwap: () => ({
    fetchBalance: (address) => bitcoin.fetchBalance(address),
    fetchUnspents: (scriptAddress) => bitcoin.fetchUnspents(scriptAddress),
    broadcastTx: (txRaw) => bitcoin.broadcastTx(txRaw),
    fetchTxInfo: txid => bitcoin.fetchTxInfo(txid),
    estimateFeeValue: ({ inSatoshis, speed, address, txSize }) => 
      //@ts-ignore
      bitcoin.estimateFeeValue({
        inSatoshis,
        speed,
        address,
        txSize,
      }),
    checkWithdraw: (scriptAddress) => bitcoin.checkWithdraw(scriptAddress),
  }),
  noxonTokenSwap: () => tokenSwap({
    network: 'testnet',
    name: 'NOXON',
    decimals: 0,
    tokenAddress: '0x60c205722c6c797c725a996cf9cca11291f90749',
  }),
  swapTokenSwap: () => tokenSwap({
    network: 'testnet',
    name: 'SWAP',
    decimals: 18,
    tokenAddress: '0xbaa3fa2ed111f3e8488c21861ea7b7dbb5a7b121',
  }),
  cashSwap: () => ({
    url: 'http://net2pay.o.atwinta.ru',
    fetchBalance: () => {},
    getURL: url => open(url),
    openURL: url => open(url),
  }),
}

export { config }