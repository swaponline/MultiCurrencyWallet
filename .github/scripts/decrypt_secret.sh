#!/bin/sh

# Decrypt the testWallets.json file for tests

cat ./tests/testWallets.json

echo "$SECRET_PASSPHRASE_FOR_TESTS"

gpg --quiet --batch --yes --decrypt --passphrase="$SECRET_PASSPHRASE_FOR_TESTS" \
--output ./tests/testWallets.json ./tests/testWallets.json.gpg