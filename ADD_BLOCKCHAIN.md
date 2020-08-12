# ADD NEW COIN

To add coin to MultiCurrencyWallet you must add



## Changes needed:

Add explorer api on 

- config/mainnet/api.js
- config/testnet/api.js

Add explorer link:
- config/mainnet/link.js
- config/testnet/api.js

Add Coin on

 - config/testnet/hiddenCoins.js
 - shared/components/Coin/Coin.js
 - shared/helpers/getCurrencyKey.js 
 - shared/helpers/user.js
 - shared/pages/CreateWallet/CreateWallet.js
 - shared/pages/CreateWallet/Steps/FirstStep.js 
 - shared/pages/Wallet/Wallet.js
 - shared/redux/reducers/createWallet.js
 - shared/redux/reducers/currencies.js

add coin data ('coinData'):

- shared/components/modals/WithdrawModal/WithdrawModal.js
- shared/pages/CreateWallet/CreateWallet.js
- shared/pages/Currency/Currency.js
- shared/pages/Wallet/Wallet.js

Add logo:
 - shared/components/ui/CurrencyIcon/images/coin.svg
 - export it here:  shared/components/ui/CurrencyIcon/images/index.js

Add fee default for the coins

- shared/helpers/constants/DEFAULT_FEE_RATES.js

Add coin decimals

- shared/helpers/constants/TOKEN_DECIMALS.js 

Add coin as dynamic fee:
 - shared/helpers/constants/coinsWithDynamicFee.js

Add min amount:
- shared/helpers/constants/minAmount.js 

create private keys names for your coin
- shared/helpers/constants/privateKeyNames.js 


create helper, use btc as reference

- shared/helpers/coin.js 

Add swap instances 

- shared/instances/newSwap.js

create coin actions, use btc as reference
- shared/redux/actions/coin.js

Add coin accordingly as is done for btc
 - shared/redux/actions/user.js