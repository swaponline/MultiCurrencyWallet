# chain params

curl http://127.0.0.1:7078/ --user test:test --data-binary '{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}' -H 'content-type:text/plain;' -v


# address balance

curl http://127.0.0.1:7078/ --user test:test --data-binary '{"jsonrpc":"1.0","id":"curltext","method":"getaddressbalance","params":[{"addresses": ["XMkvVVvuQJp4mp5hoVHUPumbnvh63xJsN4"]}]}' -H 'content-type:text/plain;' -v


# address utxos

curl http://127.0.0.1:7078/ --user test:test --data-binary '{"jsonrpc":"1.0","id":"curltext","method":"getaddressutxos","params":[{"addresses": ["XMkvVVvuQJp4mp5hoVHUPumbnvh63xJsN4"]}]}' -H 'content-type:text/plain;' -v