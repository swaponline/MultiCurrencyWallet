# Tests

As we are operating money, we need to be extra sure to fill every testcase with tests.

For brevity, in the next document the following is implied:
- `Alice` = `BTC` owner
- `Bob` = `ETH` owner
- `Alice` = order creator

# Insufficient balance

- [ ] Alice creates the order BTC2ETH, but has no funds
- [ ] Alice creates the order ETH2BTC with no ETH (she needs ETH for gas)
- [ ] Bob accepts the order, but has no funds
- [ ] Alice(Bob) passes the stage where balance is checked, but after that sends money away from her account

# Break state

- [ ] Alice gives up in the middle of the swap
- [ ] Bob accepts order multiple times
- [ ] Charlie accepts order that is currently processed between Alice and Bob
- [ ] Start swap for request not yet accepted

# Steal funds

- [ ] Alice provides BTC script that has no 24h limit, and steals both ETH and her BTC back
- [ ] Bob rejects proper BTC script (?)
- [ ] Bob steals secret tricking Alice to publish it before transfer
- [ ] Bob makes wrong ETH contract that does not send any money, but successfully steals BTC secret
