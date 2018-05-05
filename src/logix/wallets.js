import bitcoin from '../instances/bitcoin'
import ethereum from '../instances/ethereum'

// import {createAccount} from "../redux/actions";
// import store from "../redux/store";
// import user from '../instances/user'

let privateBtcKey = localStorage.getItem('privateBtcKey');
let privateEthKey = localStorage.getItem('privateEthKey');

//store.dispatch(createAccount());
if (!privateBtcKey) {
    console.log('Creating BTC adress...');
    let bitcoinData = bitcoin.login(privateBtcKey);
    localStorage.setItem('privateBtcKey', bitcoinData.privateKey);
} else {
    console.log('BTC address already exist!');
}

if (!privateEthKey) {
    console.log('Creating ETH adress...');
    let ethAccount = ethereum.login(privateEthKey);
    localStorage.setItem('privateEthKey', ethAccount.privateKey);
} else {
    console.log('ETH address already exist!');
}


// let bitcoinData = bitcoin.login(privateBtcKey);
// localStorage.setItem("myKey", serialObj);

// bitcoinData.account
// bitcoinData.keyPair
// bitcoinData.address
// bitcoinData.privateKey
// bitcoinData.publicKey

// let serialObj = JSON.stringify(obj); //сериализуем его

