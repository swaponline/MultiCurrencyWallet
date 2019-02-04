import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'


const BtcScript = ({ recipientPublicKey, secretHash, lockTime, ownerPublicKey }) => (
  <div styleName="showingScript">
    <pre>
      <code>
        {`
          bitcoinjs.script.compile([
          bitcoin.core.opcodes.OP_RIPEMD160,
          Buffer.from('${secretHash}', 'hex'),
          bitcoin.core.opcodes.OP_EQUALVERIFY,

          Buffer.from('${recipientPublicKey}', 'hex'),
          bitcoin.core.opcodes.OP_EQUAL,
          bitcoin.core.opcodes.OP_IF,

          Buffer.from('${recipientPublicKey}', 'hex'),
          bitcoin.core.opcodes.OP_CHECKSIG,

          bitcoin.core.opcodes.OP_ELSE,

          bitcoin.core.script.number.encode(${lockTime}),
          bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
          bitcoin.core.opcodes.OP_DROP,
          Buffer.from('${ownerPublicKey}', 'hex'),
          bitcoin.core.opcodes.OP_CHECKSIG,

          bitcoin.core.opcodes.OP_ENDIF,
        ])
        `}
      </code>
    </pre>
  </div>
)

export default CSSModules(BtcScript, styles)
