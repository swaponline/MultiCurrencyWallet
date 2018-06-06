# how it works?

BTC -> ETH

Alice wants to sell BTC and buy ETH, Bob owerthise wants to sell ETH and buy BTC.

 1. Alice creates order 1 BTC -> 10 ETH
 2. Bob pushes a 'Buy' button in the orders list and is redirected to /eth-to-btc/:id page.
 3. Alice is notified about Bob and is redirected to /btc-to-eth/:id page.
 4. Alice is asked to create a 'Secret Key'.
 5. The system automatically generates the 'Secret Hash', shows it to Alice and sends to Bob.
 6. The system automatically calls the ETH Swap contract method to create a swap.
 7. The system asks Bob to sign the transaction (Bob fund the ETH Swap contract here).
 8. The system automatically creates a BTC Swap script.
 9. Alice is notified that Bob fund the ETH Swap contract. The system asks Alice to fund the script (Alice fund the script here).
 10. Bob is notified that Alice fund the script.
 11. The system automatically sends the ETH Swap contract address to Alice and the script to Bob.
 12. Alice signs a call to the ETH Swap contract to withdraw ETH.
 13. Bob is notified that Alice did withdraw. Bob signs a call to the ETH Swap contract to receive the secret.
 14. Bob signs the BTC script method to withdraw 1 BTC.
 
## Swap  React

### Development mode
```
npm run start
```

### Production mode
```
nmp run build
```
