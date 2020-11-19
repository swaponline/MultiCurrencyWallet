import bitcoin from 'bitcoinjs-lib'
const net = process.env.NETWORK === 'testnet'
  ? bitcoin.networks.testnet
  : bitcoin.networks.bitcoin

/**
* creates an atomic swap bitcoin script
* @param swap_secret_hash hex with secret
* @param Bob_pubkey publicKey
* @param Alice_pubkey publicKey
* @param locktime Int
*/
const createScript = (swap_secret_hash, Alice_pubkey, Bob_pubkey, locktime) => {
  /*
  operation::list SwapScript;
  SwapScript.push_back( operation(opcode::ripemd160) );
  SwapScript.push_back( operation(swap_secret_hash) );
  SwapScript.push_back( operation(opcode::equalverify) );

  SwapScript.push_back( operation(to_chunk(Bob_pubkey)) );
  SwapScript.push_back( operation(opcode::equal) );

  SwapScript.push_back( operation(opcode::if_) );

  SwapScript.push_back( operation(to_chunk(Bob_pubkey)) );
  SwapScript.push_back( operation(opcode::checksig) );

  SwapScript.push_back( operation(opcode::else_) );
  SwapScript.push_back( operation(uint32_to_data_chunk(locktime)) );
  SwapScript.push_back( operation(opcode::checklocktimeverify) );
  SwapScript.push_back( operation(opcode::drop) );
  SwapScript.push_back( operation(to_chunk(Alice_private.to_public().point() )) );
  SwapScript.push_back( operation(opcode::checksig) );

  SwapScript.push_back( operation(opcode::endif) );
  */

  const script = bitcoin.script.compile([

    bitcoin.opcodes.OP_RIPEMD160,
    Buffer.from(swap_secret_hash, 'hex'),
    bitcoin.opcodes.OP_EQUALVERIFY,

    Buffer.from(Bob_pubkey, 'hex'),
    bitcoin.opcodes.OP_EQUAL,

    bitcoin.opcodes.OP_IF,

    Buffer.from(Bob_pubkey, 'hex'),
    bitcoin.opcodes.OP_CHECKSIG,

    bitcoin.opcodes.OP_ELSE,

    bitcoin.script.number.encode(locktime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    Buffer.from(Alice_pubkey, 'hex'),
    bitcoin.opcodes.OP_CHECKSIG,

    bitcoin.opcodes.OP_ENDIF,
  ])

  const scriptPubKey  = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(script))
  const scriptAddress = bitcoin.address.fromOutputScript(scriptPubKey, net)

  return {
    script,
    scriptPubKey,
    scriptAddress,
  }
}

export default createScript
