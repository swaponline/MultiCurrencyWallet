#!/bin/sh

# Decrypt the testWallets.json file for tests


gpg --quiet --batch --yes --decrypt --passphrase="$SECRET_PASSPHRASE" \
--output ./tests/testWallets.json ./tests/testWallets.json.gpg
