const fs = require('fs');
const path = require('path');
const util = require('util');
const router = require('express').Router();
const SMSru = require('sms_ru');

const database = require('../database.js');
const config = require('../config.js');
const btcutils = require('../btcutils.js');

const log_file_path = path.join(__dirname, '..', 'logger.log');
const log_file = fs.createWriteStream(log_file_path, { flags: 'a' });


const logger = function Logger(ip, d) { //
  log_file.write(`${util.format(`${new Date().toISOString()} [${ip}:${d}`)}\n`);
};

const timestamp = () => Math.round(+new Date() / 1000);

const getIP = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress;

const getDate = () => new Date().toISOString();

const registerStack = {};

const generateCode = () => {
  const min = 0;
  const max = 9;
  const p1 = Math.floor(Math.random() * (max - min) + min);
  const p2 = Math.floor(Math.random() * (max - min) + min);
  const p3 = Math.floor(Math.random() * (max - min) + min);
  const p4 = Math.floor(Math.random() * (max - min) + min);
  return `${p1}${p2}${p3}${p4}`;
};

console.log('Init bitcoin account');
btcutils.login(config.privateKey.mainnet, config.privateKey.testnet);
console.log('Init sms gateway');

const smsGateway = new SMSru(config.smsapi);
console.log((smsGateway) ? 'Ok' : 'Fail');

// Начало регистрации - отправка смс
router.post('/register/begin/', async (req, res) => {
  const {
    address, publicKey, phone, checkSign,
  } = req.body;
  const ip = getIP(req);

  if (address && publicKey && phone && checkSign) {
    logger(ip, `Begin register: ${address} ${publicKey} ${phone}`);
    if (btcutils.CheckPublicKey(address, publicKey, checkSign)) {
      const smsCode = generateCode();
      console.log(`Generated sms: ${smsCode}`);
      console.log(`SMS sended to: ${phone}`);

      await smsGateway.sms_send({
        to: phone,
        text: smsCode,
      }, (e) => {
        console.log(`Send SMS status:${e.description}`);
      });

      registerStack[address] = {
        publicKey,
        phone,
        smsCode,
      };
      res.status(200).json({ answer: 'ok' });
    } else {
      res.status(200).json({ error: 'Fail check sign' });
    }
  } else {
    res.status(502).json({ error: 'Bad request' });
  }
});
// Подтверждение регистрации
router.post('/register/confirm/', async (req, res) => {
  const {
    address, publicKey, phone, smsCode, checkSign, mainnet,
  } = req.body;
  const ip = getIP(req);

  if (address && publicKey && phone && smsCode && checkSign) {
    logger(ip, `Confirm register: ${address} ${publicKey} ${phone}`);
    if (btcutils.CheckPublicKey(address, publicKey, checkSign)) {
      if (registerStack[address]
        // eslint-disable-next-line eqeqeq
        && (registerStack[address].publicKey == publicKey)
        // eslint-disable-next-line eqeqeq
        && (registerStack[address].phone == phone)
        // eslint-disable-next-line eqeqeq
        && (registerStack[address].smsCode == smsCode)
      ) {
        const exists = database.exist(address, publicKey, mainnet);
        if (!exists) {
          const answer = await database.add(address, publicKey, phone, checkSign, mainnet);
          if (answer.error) {
            logger(ip, `Fail register: ${address} ${phone} ${publicKey} ${answer.error}`);
            res.status(200).json({ error: answer.error });
          } else {
            res.status(200).json({ answer: 'ok' });
          }
        // eslint-disable-next-line eqeqeq
        } else if (exists.phone && exists.phone == phone) {
          res.status(200).json({ error: 'Already registered' });
        } else {
          res.status(200).json({ error: 'This wallet already locked by other phone number' });
        }
      } else {
        res.status(200).json({ error: 'Sms code not valid' });
      }
    } else {
      res.status(200).json({ error: 'Fail check sign' });
    }
  } else {
    res.status(502).json({ error: 'Bad request' });
  }
});
// Проверяет наличие регистрации.
router.post('/login/', async (req, res) => {
  const { address, publicKey } = req.body;
  const ip = getIP(req);
  logger(ip, 'Check login');
  if (address && publicKey) {
    if (database.exist(address, publicKey)) {
      res.status(200).json({ answer: 'Exist' });
    } else {
      res.status(200).json({ answer: 'Not found' });
    }
  } else {
    res.status(502).json({ error: 'Bad request' });
  }
});

// Принимает полу-подписаную транзакцию и отправляет смс код
router.post('/push/', async (req, res) => {
  const ip = getIP(req);
  const {
    address, publicKey, checkSign, rawTX, mainnet,
  } = req.body;
  logger(ip, 'Push tx and send sms');
  // Dunno how it works :) But i ll leave it as i saw it for now
  // eslint-disable-next-line no-sequences
  if (address, publicKey, checkSign, rawTX) {
    const user = database.exist(address, publicKey);
    if (user) {
      const answer = await database.pushTX(address, publicKey, rawTX, checkSign, mainnet);
      if (answer.error) {
        logger(ip, `Fail push TX: ${address} ${user.phone} ${publicKey} ${answer.error}`);
        res.status(200).json({ error: answer.error });
      } else {
        const smsCode = generateCode();
        console.log(`Phone: ${user.phone}`);
        console.log(`SMS: ${smsCode}`);
        await smsGateway.sms_send({
          to: user.phone,
          text: smsCode,
        }, (e) => {
          console.log(`Send SMS status:${e.description}`);
        });
        // SEND SMS
        if (database.pushSMS(address, publicKey, mainnet, smsCode)) {
          res.status(200).json({ answer: 'ok' });
        } else {
          res.status(200).json({ error: 'Fail save sms code' });
        }
      }
    } else {
      res.status(200).json({ error: 'User not exist' });
    }
  } else {
    res.status(502).json({ error: 'Bad request' });
  }
});

// Сверяет
router.post('/sign/', async (req, res) => {
  const ip = getIP(req);
  const {
    address, publicKey, checkSign, code, mainnet,
  } = req.body;
  logger(ip, 'Sign TX');
  // Lol how that works xD
  // For now i ll leave it like it was
  // eslint-disable-next-line no-sequences
  if (address, publicKey, checkSign, code) {
    const answer = await database.validateSMS(address, publicKey, code, checkSign, mainnet);
    if (answer.error) {
      logger(ip, `Fail validate SMS: ${address} ${publicKey} ${answer.error}`);
      res.status(200).json({ error: answer.error });
    } else {
      logger(ip, `TX validated: ${address} ${publicKey}`);
      // SMS Validated
      const rawTX = answer;
      const signedTX = await btcutils.SignTX(publicKey, rawTX, mainnet);
      // Broadcast TX
      console.log('Signed - broadcast');
      const txID = await btcutils.broadcast(signedTX);
      if (txID) {
        logger(ip, `txID: ${txID}`);
        res.status(200).json({
          answer: 'ok',
          txID,
        });
      } else {
        // Если броадкаст не удался (апи отказал или еще что),
        // то вернем ошибку и подписаную транзакцию.
        // Пускай вторая сторона пробует броадкаст
        res.status(200).json({ error: 'Fail broadcast', rawTX: signedTX });
      }
    }
  } else {
    res.status(502).json({ error: 'Bad request' });
  }
});

module.exports = router;
