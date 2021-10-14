#!/bin/sh

# Decrypt the testWallets.json file for tests

cat ./tests/testWallets.json

gpg --quiet --batch --yes --decrypt --passphrase="$SECRET_PASSPHRASE" \
--output ./tests/testWallets.json ./tests/testWallets.json.gpg

cat ./tests/testWallets.json