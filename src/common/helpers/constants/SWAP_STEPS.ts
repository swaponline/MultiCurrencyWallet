export default {
    FIRST_STEP:                 ['sign'],

    TAKER_UTXO_SECOND_STEPS:    ['submit-secret', 'sync-balance', 'lock-utxo', 'wait-lock-eth'],
    MAKER_UTXO_SECOND_STEPS:    ['sync-balance', 'wait-lock-eth', 'lock-utxo'],
    TAKER_AB_SECOND_STEPS:      ['submit-secret', 'sync-balance', 'lock-eth', 'wait-lock-utxo'],
    MAKER_AB_SECOND_STEPS:      ['wait-lock-utxo', 'verify-script', 'sync-balance', 'lock-eth'],

    TAKER_UTXO_THIRD_STEPS:     ['withdraw-eth'],
    MAKER_UTXO_THIRD_STEPS:     ['wait-withdraw-utxo', 'withdraw-eth'],
    TAKER_AB_THIRD_STEPS:       ['withdraw-utxo'],
    MAKER_AB_THIRD_STEPS:       ['wait-withdraw-eth', 'withdraw-utxo'],

    FOURTH_STEP:                ['finish', 'end']
}