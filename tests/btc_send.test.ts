import helpers from  '../src/front/shared/helpers'
import btcActions from "../src/front/shared/redux/actions/btc";
import config from '../src/front//local_modules/app-config'

const hasAdminFee = (config
  && config.opts
  && config.opts.fee
  && config.opts.fee.btc
  && config.opts.fee.btc.fee
  && config.opts.fee.btc.address
  && config.opts.fee.btc.min
) ? config.opts.fee.btc : false;

const NETWORK = "TESTNET"

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

test('send regular transaction', async () => {
  const options = {
    from: 'mjCrCbTP5UqzDCSN86uGqBfJCgYBcbCmuy',
    to: 'mwcbYjxbizC5ejSrfjUhjuiT56vQCTqLmY',
    amount: 1e3,
    feeValue: null,
    speed: "fast"
  };

  const txHash = btcActions.send(options)
  const txInfo = btcActions.fetchTxInfo(txHash, 10000)
})