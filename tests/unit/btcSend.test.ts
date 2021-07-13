import BigNumber from 'bignumber.js'

import btcUtils from  '../../src/common/utils/coin/btc'
import actions from '../../src/front/shared/redux/actions'


const NETWORK = 'TESTNET'

const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

const toFloorValue = (value: BigNumber): number => value.multipliedBy(0.95).toNumber()
const toCeilingValue = (value: BigNumber): number => value.multipliedBy(1.05).toNumber()

const fetchTxInfo = async (txHash: string | any, isMultisign: boolean = false, serviceFee?: any, iteration: number = 0) => {
  console.log('iteration', isMultisign, txHash, iteration)
  try {
    const {
      amount,
      minerFee,
      adminFee,
      size
    } = isMultisign ? await actions.btcmultisig.fetchTxInfo(txHash, 8000, serviceFee) : await actions.btc.fetchTxInfo(txHash, 8000, serviceFee)
    console.log('fetchTxInfo', isMultisign, amount, minerFee, adminFee, size)
    return {
      amount,
      minerFee,
      adminFee,
      size
    }
  } catch (e) {
    if (iteration > 8) {
      console.error(e)
    } else {
      await timeOut(10 * 1000)
      return await fetchTxInfo(txHash, isMultisign, serviceFee, ++iteration)
    }
  }
}


describe('BTC Send Tests', () => {
  it('calculate txSize of 1 txIn, 2 txOut and method send for P2PKH address', async () => {
    const params = {
      txIn: 1,
      txOut: 2,
      method: 'send',
      fixed: false,
      toAddress: 'mjCrCbTP5UqzDCSN86uGqBfJCgYBcbCmuy',
      NETWORK
    };

    const txSize = await btcUtils.calculateTxSize(params);
    expect(txSize).toBe(230);
  }, 2000);

  it('send and check transaction via regular wallet with 1000 satoshis', async () => {
    await actions.btc.login("cS3TJmYMW1QnnuFV31iyuP6W22LM8oF9VDbGC5j3Hx2ieiZtVzVi");
    const options = {
      from: 'mjCrCbTP5UqzDCSN86uGqBfJCgYBcbCmuy',
      to: 'mmorWg8tkUmwudQ2cvn7GC3PwE5XgDaBbn',
      amount: 1e-5,
      feeValue: new BigNumber(1e-5),
      speed: "fast",
    };

    let unspents = await actions.btc.fetchUnspents(options.from)

    unspents = await actions.btc.prepareUnspents({
      amount: options.feeValue.plus(options.amount).dp(8).toNumber(),
      unspents
    })

    const txIn = unspents.length
    const txOut = 2

    const txSize = await btcUtils.calculateTxSize({
      fixed: false,
      method: 'send',
      txIn,
      txOut,
      toAddress: options.to,
    })
    const satoshiPerByte = 2

    options.feeValue = new BigNumber(txSize)
      .multipliedBy(satoshiPerByte)
      .multipliedBy(1e-8)

    const txHash = await actions.btc.send(options);
    await timeOut(5 * 1000)
    const {
      amount,
      minerFee,
      size
    } = await fetchTxInfo(txHash);
    expect(amount).toBe(options.amount);
    expect(minerFee).toBeWithinRange(toFloorValue(options.feeValue), toCeilingValue(options.feeValue));
    expect(size).toBeWithinRange(toFloorValue(new BigNumber(txSize)), toCeilingValue(new BigNumber(txSize)));
  }, 145000)

  it('send and check transaction via regular wallet with 1000 satoshis with adminFee', async () => {
    const serviceFee = {
      fee: '5',
      address: '2MuXz9BErMbWmoTshGgkjd7aMHeaxV8Bdkk',
      min: '0.00001',
    }

    const options = {
      from: 'mwcbYjxbizC5ejSrfjUhjuiT56vQCTqLmY',
      to: 'mpb5DPTbz6Mu9RkvS1ctMRQeZc7r3GnLdn',
      amount: 1e-5,
      feeValue: new BigNumber(1e-5),
      speed: "fast",
      serviceFee
    };

    const adminFeeMin = new BigNumber(serviceFee.min);
    let feeFromAmount = new BigNumber(serviceFee.fee).dividedBy(100).multipliedBy(options.amount);
    if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin;

    let unspents = await actions.btc.fetchUnspents(options.from)
    unspents = await actions.btc.prepareUnspents({ amount: feeFromAmount.plus(options.amount).plus(options.feeValue).dp(8).toNumber(), unspents })
    const txIn = unspents.length
    const txOut = 3

    const txSize = await btcUtils.calculateTxSize({
      fixed: false,
      method: 'send',
      txIn,
      txOut,
      toAddress: options.to,
      serviceFee,
    })
    const satoshiPerByte = 2
    options.feeValue = new BigNumber(txSize).multipliedBy(satoshiPerByte).multipliedBy(1e-8)

    await actions.btc.login("cR2QGm1SLqmvgYBUtroVmVaBRKSSsbAAeqQ54YTA4xXELCcyoWtL");

    const txHash = await actions.btc.send(options);
    await timeOut(5 * 1000)
    const {
      amount,
      minerFee,
      adminFee,
      size
    } = await fetchTxInfo(txHash, false, serviceFee);

    expect(amount).toBe(options.amount);
    expect(adminFee).toBe(feeFromAmount.toNumber());
    expect(minerFee).toBeWithinRange(toFloorValue(options.feeValue), toCeilingValue(options.feeValue));
    expect(size).toBeWithinRange(toFloorValue(new BigNumber(txSize)), toCeilingValue(new BigNumber(txSize)));
  }, 145000)

  it('send and check transaction via pin-protected wallet sign with mnemonic with 1000 satoshis', async () => {
    await actions.btcmultisig.login_PIN(
      "cNS7asAySqoMuxZZ37kdgpcEAbgyyEHzuLPHSi9ZLSpFvjcrMJ2T",
      [
        '02094916ddab5abf215a49422a71be54ceb92c3d8114909048fc45ee90acdb5b32',
        '021b4831998fac23b570113b6871e4e36ece5c54805864429ae629459c47aa2b38'
      ]);
    const options = {
      from: '2N7zffm6Yt4VQS7Z5cuzNi2sdhpZjitLW9Y',
      to: 'mwcbYjxbizC5ejSrfjUhjuiT56vQCTqLmY',
      amount: 1e-5,
      feeValue: new BigNumber(1e-5),
      speed: "fast",
      password: '1234',
      mnemonic: 'execute tunnel height sponsor raccoon random federal infant reform foil fall physical'
    };

    let unspents = await actions.btc.fetchUnspents(options.from)
    unspents = await actions.btc.prepareUnspents({ amount: options.feeValue.plus(options.amount).dp(8).toNumber(), unspents })
    const txIn = unspents.length
    const txOut = 2

    const txSize = await btcUtils.calculateTxSize({
      fixed: false,
      method: 'send_2fa',
      txIn,
      txOut,
      toAddress: options.to,
    })
    const satoshiPerByte = 2
    options.feeValue = new BigNumber(txSize).multipliedBy(satoshiPerByte).multipliedBy(1e-8)

    const txHash = await actions.btcmultisig.sendPinProtected(options);
    await timeOut(5 * 1000)
    const {
      amount,
      minerFee,
      size
    } = await fetchTxInfo(txHash.txId, true);
    expect(amount).toBe(options.amount);
    expect(minerFee).toBeWithinRange(toFloorValue(options.feeValue), toCeilingValue(options.feeValue));
    expect(size).toBeWithinRange(toFloorValue(new BigNumber(txSize)), toCeilingValue(new BigNumber(txSize)));
  }, 145000)

  it('send and check transaction via pin-protected wallet sign with password with 1000 satoshis with adminFee', async () => {
    const serviceFee = {
      fee: '5',
      address: '2MuXz9BErMbWmoTshGgkjd7aMHeaxV8Bdkk',
      min: '0.00001',
    }
    const options = {
      from: '2NFQKANcjECN6oQeMiY7qGN5zVN7G1aumXd',
      to: 'muvWWSHgZoT8ehmL6oj8AvbgVvzkkAxhCM',
      amount: 1e-5,
      feeValue: new BigNumber(1e-5),
      speed: "fast",
      password: '4321',
      mnemonic: '',
      serviceFee
    };

    const adminFeeMin = new BigNumber(serviceFee.min);
    let feeFromAmount = new BigNumber(serviceFee.fee).dividedBy(100).multipliedBy(options.amount);
    if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin;

    let unspents = await actions.btc.fetchUnspents(options.from)
    unspents = await actions.btc.prepareUnspents({ amount: feeFromAmount.plus(options.amount).plus(options.feeValue).dp(8).toNumber(), unspents })
    const txIn = unspents.length
    const txOut = 3

    const txSize = await btcUtils.calculateTxSize({
      fixed: false,
      method: 'send_2fa',
      txIn,
      txOut,
      toAddress: options.to,
      serviceFee,
    })
    const satoshiPerByte = 2
    options.feeValue = new BigNumber(txSize).multipliedBy(satoshiPerByte).multipliedBy(1e-8)

    await actions.btc.login("cRQL8PDx7WRJzdi6g3fAagLA3bEc4XMfjDDkDkuheFcX5TRHqEMX");

    await actions.btcmultisig.login_PIN(
      "cRQL8PDx7WRJzdi6g3fAagLA3bEc4XMfjDDkDkuheFcX5TRHqEMX",
      [
        '02094916ddab5abf215a49422a71be54ceb92c3d8114909048fc45ee90acdb5b32',
        '02a4e22494fccc9deb4ed62a05f1cf0503ce4a4d8b2858c257f1c6de78fd3b9afe'
      ]);

    const txHash = await actions.btcmultisig.sendPinProtected(options);
    await timeOut(5 * 1000)
    const {
      amount,
      minerFee,
      adminFee,
      size
    } = await fetchTxInfo(txHash.txId, true, serviceFee);
    expect(amount).toBe(options.amount);
    expect(adminFee).toBe(feeFromAmount.toNumber());
    expect(minerFee).toBeWithinRange(toFloorValue(options.feeValue), toCeilingValue(options.feeValue));
    expect(size).toBeWithinRange(toFloorValue(new BigNumber(txSize)), toCeilingValue(new BigNumber(txSize)));
  }, 145000)
})