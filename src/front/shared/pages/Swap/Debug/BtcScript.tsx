import React from 'react'


const BtcScript = ({ recipientPublicKey, secretHash, lockTime, ownerPublicKey }) => (
  <div>
    {`
bitcoinjs.script.compile([

  this.app.env.bitcoin.opcodes.OP_SIZE,
  Buffer.from('20' ,'hex'),
  this.app.env.bitcoin.opcodes.OP_EQUALVERIFY,

  bitcoin.core.opcodes.OP_RIPEMD160,
  Buffer.from('${secretHash}', 'hex'),
  bitcoin.core.opcodes.OP_EQUALVERIFY,

  Buffer.from('${recipientPublicKey}', 'hex'),
  bitcoin.core.opcodes.OP_EQUAL,
  bitcoin.core.opcodes.OP_IF,

  Buffer.from('${recipientPublicKey}', 'hex'),

  bitcoin.core.opcodes.OP_ELSE,

  bitcoin.core.script.number.encode(${lockTime}),
  bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
  bitcoin.core.opcodes.OP_DROP,
  Buffer.from('${ownerPublicKey}', 'hex'),

  bitcoin.core.opcodes.OP_ENDIF,

  bitcoin.core.opcodes.OP_CHECKSIG,
])
    `}
  </div>
)

export default BtcScript
