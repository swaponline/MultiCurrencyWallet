import bitcoin from '../instances/bitcoin'
import ethereum from '../instances/ethereum'

let privateBtcKey = localStorage.getItem('privateBtcKey');
let privateEthKey = localStorage.getItem('privateEthKey')
let addressBtc, addressEth

function getWalletsData() {
    // bitcoinData.account
    // bitcoinData.keyPair
    // bitcoinData.address
    // bitcoinData.privateKey
    // bitcoinData.publicKey
    if (!privateBtcKey) {
        console.log('Creating BTC address...');
        let bitcoinData = bitcoin.login(privateBtcKey);
        privateBtcKey = bitcoinData.privateKey
        addressBtc = bitcoinData.address
        localStorage.setItem('privateBtcKey', privateBtcKey);
        localStorage.setItem('addressBtc', addressBtc);
    } else {
        addressBtc = localStorage.getItem('addressBtc');
        console.log('BTC address already exist!');
    }

    if (!privateEthKey) {
        console.log('Creating ETH address...');
        let ethAccount = ethereum.login(privateEthKey);
        addressEth = ethAccount.address
        localStorage.setItem('privateEthKey', ethAccount.privateKey);
        localStorage.setItem('addressEth', addressEth);
    } else {
        addressEth = localStorage.getItem('addressEth');
        console.log('ETH address already exist!');
    }

    return [
        {
            "currency": "BTC",
            "balance": "under construction",
            "address": addressBtc,
        },
        {
            "currency": "ETH",
            "balance": "under construction",
            "address": addressEth,
        },
    ]
}

export default getWalletsData
