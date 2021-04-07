import helpers from  '../src/front/shared/helpers'
import actions from "../src/front/shared/redux/actions";
import BigNumber from 'bignumber.js';

const timeOut = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

describe('BTC Send Tests', () => {
  it('calculate txSize of 1 txIn, 2 txOut and method send for P2PKH address', async () => {
    const params = {
      txIn: 1,
      txOut: 2,
      method: 'send',
      fixed: false,
      toAddress: 'mjCrCbTP5UqzDCSN86uGqBfJCgYBcbCmuy'
    };

    const txSize = await helpers.btc.calculateTxSize(params);
    expect(txSize).toBe(230);
  }, 2000);

  it('send and check transaction via regular wallet with 1000 satoshis', async () => {
    await actions.btc.login("cS3TJmYMW1QnnuFV31iyuP6W22LM8oF9VDbGC5j3Hx2ieiZtVzVi");
    const options = {
      from: 'mjCrCbTP5UqzDCSN86uGqBfJCgYBcbCmuy',
      to: 'mmorWg8tkUmwudQ2cvn7GC3PwE5XgDaBbn',
      amount: 1e-5,
      feeValue: new BigNumber(1e-5),
      speed: "fast"
    };

    const txHash = await actions.btc.send(options);
    await timeOut(5 * 1000)
    const {
      amount,
      senderAddress,
      receiverAddress,

      minerFee,
      adminFee,
      minerFeeCurrency,

      size
    } = await actions.btc.fetchTxInfo(txHash, 8000);
    expect(amount).toBe(options.amount);
    expect(minerFee).toBe(options.feeValue.toNumber());
  }, 20000)

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

    await actions.btc.login("cR2QGm1SLqmvgYBUtroVmVaBRKSSsbAAeqQ54YTA4xXELCcyoWtL");

    const txHash = await actions.btc.send(options);
    await timeOut(5 * 1000)
    const {
      amount,
      senderAddress,
      receiverAddress,

      minerFee,
      adminFee,
      minerFeeCurrency,

      size
    } = await actions.btc.fetchTxInfo(txHash, 8000, serviceFee);

    expect(amount).toBe(options.amount);
    expect(minerFee).toBe(options.feeValue.toNumber());
    expect(adminFee).toBe(feeFromAmount.toNumber());
  }, 20000)

  it('send and check transaction via pin-protected wallet with 1000 satoshis', async () => {
    await actions.btcmultisig.login_PIN(
      "cNS7asAySqoMuxZZ37kdgpcEAbgyyEHzuLPHSi9ZLSpFvjcrMJ2T",
      [
        '02094916ddab5abf215a49422a71be54ceb92c3d8114909048fc45ee90acdb5b32',
        '021b4831998fac23b570113b6871e4e36ece5c54805864429ae629459c47aa2b38'
      ]);
    const options = {
      from: '2N7zffm6Yt4VQS7Z5cuzNi2sdhpZjitLW9Y',
      to: 'mosm1NmQZETUQvH68C9kbS8F3nuVKD7RDk',
      amount: 1e-5,
      feeValue: new BigNumber(1e-5),
      speed: "fast",
      password: '1234',
      mnemonic: 'execute tunnel height sponsor raccoon random federal infant reform foil fall physical'
    };

    const txHash = await actions.btcmultisig.sendPinProtected(options);
    await timeOut(5 * 1000)
    const {
      amount,
      senderAddress,
      receiverAddress,

      minerFee,
      adminFee,
      minerFeeCurrency,

      size
    } = await actions.btcmultisig.fetchTxInfo(txHash.txId, 8000);
    expect(amount).toBe(options.amount);
    expect(minerFee).toBe(options.feeValue.toNumber());
  }, 20000)

  it('send and check transaction via pin-protected wallet with 1000 satoshis with adminFee', async () => {
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
      mnemonic: 'uphold wing axis omit hedgehog pull law nature runway sort pattern unhappy',
      serviceFee
    };

    const adminFeeMin = new BigNumber(serviceFee.min);
    let feeFromAmount = new BigNumber(serviceFee.fee).dividedBy(100).multipliedBy(options.amount);
    if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin;

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
      senderAddress,
      receiverAddress,

      minerFee,
      adminFee,
      minerFeeCurrency,

      size
    } = await actions.btcmultisig.fetchTxInfo(txHash.txId, 8000, serviceFee);
    expect(amount).toBe(options.amount);
    expect(minerFee).toBe(options.feeValue.toNumber());
    expect(adminFee).toBe(feeFromAmount.toNumber());
  }, 20000)
})