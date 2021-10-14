#!/bin/sh

# Decrypt the testWallets.json file for tests
gpg --quiet --batch --yes --decrypt --passphrase="$SECRET_PASSPHRASE_FOR_TESTS" \
--output $HOME/tests/testWallets.json $HOME/tests/testWallets.json.gpp