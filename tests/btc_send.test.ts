import helpers from  '../src/front/shared/helpers'
import btcActions from "../src/front/shared/redux/actions/btc";
import BigNumber from 'bignumber.js';

test('calculate txSize of 1 txIn, 2 txOut and method send for P2PKH address', async () => {
  const params = {
    txIn: 1,
    txOut: 2,
    method: 'send',
    fixed: false,
    toAddress: 'mjCrCbTP5UqzDCSN86uGqBfJCgYBcbCmuy'
  };

  const txSize = await helpers.btc.calculateTxSize(params);
  expect(txSize).toBe(230);
});

test('send regular transaction with 1000 satoshis', async () => {
  await btcActions.login("cS3TJmYMW1QnnuFV31iyuP6W22LM8oF9VDbGC5j3Hx2ieiZtVzVi");
  const options = {
    from: 'mjCrCbTP5UqzDCSN86uGqBfJCgYBcbCmuy',
    to: 'mwcbYjxbizC5ejSrfjUhjuiT56vQCTqLmY',
    amount: 1e-5,
    feeValue: new BigNumber(1e-5),
    speed: "fast"
  };

  const txHash = await btcActions.send(options);
  const {
    amount,
    senderAddress,
    receiverAddress,

    minerFee,
    adminFee,
    minerFeeCurrency,

    size
  } = await btcActions.fetchTxInfo(txHash, 10000);
  expect(amount).toBe(options.amount);
})

test('send regular transaction with 1000 satoshis with adminFee', async () => {
  const serviceFee = {
    fee: '5',
    address: '2MuXz9BErMbWmoTshGgkjd7aMHeaxV8Bdkk',
    min: '0.00001',
  }

  const options = {
    from: 'mwcbYjxbizC5ejSrfjUhjuiT56vQCTqLmY',
    to: 'mjCrCbTP5UqzDCSN86uGqBfJCgYBcbCmuy',
    amount: 1e-5,
    feeValue: new BigNumber(1e-5),
    speed: "fast",
    serviceFee
  };

  const adminFeeMin = new BigNumber(serviceFee.min);
  let feeFromAmount = new BigNumber(serviceFee.fee).dividedBy(100).multipliedBy(options.amount);
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin;

  await btcActions.login("cR2QGm1SLqmvgYBUtroVmVaBRKSSsbAAeqQ54YTA4xXELCcyoWtL");

  const txHash = await btcActions.send(options);
  const {
    amount,
    senderAddress,
    receiverAddress,

    minerFee,
    adminFee,
    minerFeeCurrency,

    size
  } = await btcActions.fetchTxInfo(txHash, 10000, serviceFee);

  expect(amount).toBe(options.amount);
  expect(adminFee).toBe(feeFromAmount.toNumber());
})