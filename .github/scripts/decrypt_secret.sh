#!/bin/sh

# Decrypt the testWallets.json file for tests

ls ./tests

gpg --quiet --batch --yes --decrypt --passphrase="$SECRET_PASSPHRASE_FOR_TESTS" \
--output /home/runner/work/MultiCurrencyWallet/MultiCurrencyWallet/tests/testWallets.json /home/runner/work/MultiCurrencyWallet/MultiCurrencyWallet/tests/testWallets.json.gpg