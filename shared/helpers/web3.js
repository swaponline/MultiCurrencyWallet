import Web3 from 'web3'
import config from 'app-config'


const web3 = new Web3(new Web3.providers.HttpProvider(config.web3.provider))
import Keychain from 'keychain'


const keychain = new Keychain(web3)
// keychain.ws.onopen = async function () {
//   keychain.command({ command: 'version' }, (err, result) => {
//     console.log('why not ? error:', err, ' result: ', result)
//   })
//
//   // const privateKey = '0xb3d3427eea7867c243baaf2f4c67a9551eea2ea96556acfb0051dffa18d182d4';
//   const to = '0xE8899BA12578d60e4D0683a596EDaCbC85eC18CC'
//   const value = 100
//   const data = ''
//   const gas = 21000
//   const nonce = 0
//   const gasPrice = 100
//   const chainId = 3
//
//   const transactionParams = {
//     nonce,
//     gasPrice,
//     to,
//     value,
//     data,
//     gas,
//     chainId,
//   }
//   // console.log('BEFORE sign transaction');
//   // const resSignTransaction = await web3.eth.accounts.signTransaction(transactionParams, 'test1@a163e24363c73ce3')
//   // console.log('resSignTransaction: ', resSignTransaction);
//
//
//   console.log('BeFOrE sign')
//   const resSign = await web3.eth.accounts.sign('hello yo', 'test1@a163e24363c73ce3')
//   console.log('resSign: ', resSign)
//
// }


export default web3
