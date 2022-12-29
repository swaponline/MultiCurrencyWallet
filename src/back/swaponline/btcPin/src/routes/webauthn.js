const fs = require('fs');
const path = require('path');
const util = require('util');
const router = require('express').Router();
const SMSru = require('sms_ru');

const database = require('../database.js');
const config = require('../config.js');
const btcutils = require('../btcutils.js');
const utils = require('../../utils');

const log_file_path = path.join(__dirname, '..', 'logger.log');
const log_file = fs.createWriteStream(log_file_path, { flags: 'a' });


const logger = function Logger(ip, d) { //
  log_file.write(`${util.format(`${new Date().toISOString()} [${ip}:${d}`)}\n`);
};

const timestamp = () => Math.round(+new Date() / 1000);

const getIP = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress;

const getDate = () => new Date().toISOString();

router.post('/register/webauthn/', async (req, res) => {
  if (!req.body || !req.body.address || !req.body.publicKey) {
    res.json({
      status: 'failed',
      message: 'req missing publicKey or address field!',
    });

    return;
  }

  const {
    address, publicKey, checkSign, mainnet,
  } = req.body;

  if (database.users[address] && database[address].sign) {
    res.json({
      status: 'failed',
      message: `Wallet ${address} already exists`,
    });

    return;
  }

  const innerSign = utils.randomBase64URLBuffer();

  // Если юзер зарегистрирован через телефон
  if (database.users[address] && !database[address].sign && database.users[address].phone.length > 0) {
    database.addUser(address, publicKey, database.users[address].phone, checkSign, mainnet, innerSign);
  } else {
    database.addUser(address, publicKey, '', checkSign, mainnet, innerSign);
  }

  const challengeMakeCred = utils.generateServerMakeCredRequest(address, publicKey, innerSign);
  challengeMakeCred.status = 'ok';

  req.session.challenge = challengeMakeCred.challenge;
  req.session.address = address;

  res.json(challengeMakeCred);
});


module.exports = router;
