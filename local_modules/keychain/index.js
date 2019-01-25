import EthereumTx from 'ethereumjs-tx'
import { pubToAddress } from 'ethereumjs-util';

class Keychain {

  constructor(web3) {
    const url = 'ws://localhost:16384/';
    this.ws = new WebSocket(url);
    this.web3 = web3;
    const _parent = this;
    this.ws.onmessage = function (response) {
      try {
        const res = JSON.parse(response.data);
        _parent.queue.shift()(res);
      } catch (e) {
        console.log('response.data: ', response.data);
        console.log('Error: ', e);
      }
    };
    this.queue = [];

    web3.eth.accounts.sign = this.sign.bind(this)
    web3.eth.accounts.signTransaction = this.signTransaction.bind(this)
    web3.eth.accounts.privateKeyToAccount = this.privateKeyToAccount.bind(this)
  }

  command(request, callback) {
    this.ws.send(JSON.stringify(request));
    this.queue.push(callback);
  };

  /** Promise implementation of the 'command' method */
  method(request) {
    const _parent = this;
    return new Promise(function (resolve, reject) {
      _parent.command(request, resolve);
    })
  }

  async selectKey() {
    const result = await this.method({ command: 'select_key' });
    if (result.result) {
      this.selectedKey = '0x' + result.result;
      this.selectedAddress = '0x' + pubToAddress(this.selectedKey).toString('hex')
    }
  }

  // async create() {
  //   const result = await this.method({
  //     command: 'create',
  //     params: {
  //       keyname: new Date(),
  //       encrypted: true,
  //       curve: 'secp256k1',
  //       cipher: 'aes256'
  //     }
  //   })
  //   const keyname = result.result;
  //   const publicKeyResult = await this.method({ command: 'public_key', params: { keyname } })
  //   const publicKey = publicKeyResult.result;
  //   return {
  //     address: '0x' + publicKey,
  //     privateKey: keyname,
  //     signTransaction: this.signTransaction,
  //     sign: this.sign,
  //   }
  // }

  privateKeyToAccount() {
    if (!this.selectedKey) {
      throw new Error('Please call KeyChain.selectKey() method before calling KeyChain.privateKeyToAccount()')
    }
    return {
      address: this.selectedAddress,
      privateKey: this.selectedKey,
      signTransaction: this.signTransaction,
      sign: this.sign,
      encrypt: this.web3.eth.accounts.create
    }
  }

  async sign(data, public_key) {
    const prefix = "\x19Ethereum Signed Message:\n" + data.length;
    const hash = this.web3.utils.sha3(prefix + data).substr(2);

    const result = await this.method({ command: 'sign_hash', params: { hash, public_key } });
    const signature = result.result;
    const ret = Keychain.rsv(signature, 0);
    return {
      message: data,
      messageHash: '0x' + hash,
      v: ret.v,
      r: ret.r,
      s: ret.s,
      signature: '0x' + signature
    };
  };

  async signTransaction(tx, privateKey) {
    if (!tx.chainId) {
      tx.chainId = await this.web3.eth.net.getId();
    }
    if (!tx.nonce) {
      tx.nonce = await this.web3.eth.getTransactionCount(this.selectedAddress);
    }
    if (!tx.gasPrice) {
      tx.gasPrice = await this.web3.eth.getGasPrice().then(Number);
    }
    tx.value = Number(tx.value);
    const rsv = Keychain.rsv('', tx.chainId);
    const result = Keychain.getResult(rsv, tx);
    const rawHex = result.rawTransaction;
    const messageHashInitial = result.messageHash;

    const params = { public_key: privateKey, transaction: rawHex, blockchain_type: "ethereum" };
    return this.method({ command: 'sign_hex', params })
      .then(data => {
        const signature = data.result;
        const rsv = Keychain.rsv(signature, tx.chainId);
        const result = Keychain.getResult(rsv, tx);
        return {
          ...rsv,
          rawTransaction: '0x' + result.rawTransaction,
          messageHash: '0x' + messageHashInitial
        }
      });
  };

  static getResult(rsv, tx) {
    const txParams = { ...tx, ...rsv };
    const ethTx = new EthereumTx(txParams);
    const buffer = ethTx.serialize();
    const rawTransaction = buffer.toString('hex');
    const messageHash = ethTx.hash().toString('hex');
    return { messageHash, rawTransaction }
  };


  static rsv(signature, chainId) {
    const ret = {};
    if (signature) {
      ret.r = `0x${signature.slice(0, 64)}`;
      ret.s = `0x${signature.slice(64, 128)}`;
      const recovery = parseInt(signature.slice(128, 130), 16);
      let tmpV = recovery + 27;
      if (chainId > 0) {
        tmpV += chainId * 2 + 8;
      }
      let hexString = tmpV.toString(16);
      if (hexString.length % 2) {
        hexString = '0' + hexString;
      }
      ret.v = `0x${hexString}`;
    } else {
      ret.r = '0x00';
      ret.s = '0x00';
      ret.v = chainId;
    }
    return ret;
  }

}

export default Keychain
