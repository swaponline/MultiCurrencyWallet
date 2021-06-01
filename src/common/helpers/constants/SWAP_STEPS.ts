export default {
    FIRST_STEP:                 ['sign'],

    TAKER_UTXO_SECOND_STEPS:    ['submit-secret', 'sync-balance', 'lock-utxo', 'wait-lock-eth'],
    MAKER_UTXO_SECOND_STEPS:    ['sync-balance', 'wait-lock-eth', 'lock-utxo'],
    TAKER_EVM_SECOND_STEPS:      ['submit-secret', 'sync-balance', 'lock-eth', 'wait-lock-utxo'],
    MAKER_EVM_SECOND_STEPS:      ['wait-lock-utxo', 'verify-script', 'sync-balance', 'lock-eth'],

    TAKER_UTXO_THIRD_STEPS:     ['withdraw-eth'],
    MAKER_UTXO_THIRD_STEPS:     ['wait-withdraw-utxo', 'withdraw-eth'],
    TAKER_EVM_THIRD_STEPS:       ['withdraw-utxo'],
    MAKER_EVM_THIRD_STEPS:       ['wait-withdraw-eth', 'withdraw-utxo'],

    FOURTH_STEP:                ['finish', 'end']
}