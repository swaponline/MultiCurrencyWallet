Why the fees are so high? Other wallets have lower fees. 

Most likely your transaction SIZE is very large. The mining fee for every transaction depends on the count of input and output transactions. The size increases by 

# 1. Due to many small previous transactions to the "sender" wallet. (to spend such balance it requires 2x, 3x, 10x, 20x higher mining fee than normal! )

Normal scenario. 
1. user deposits 100$ to the wallet
2. suer send 10$, $20, etc. The mining fee is normal in this case.

Worse scenario. 
1. user deposits $2, $3, $5, $5, $50, etc.. 
2. user try to spend ALL from the balance
3. in this case the mining fee will be very high. 

![](https://screenshots.wpmix.net/chrome_BYWhxQItdpLJ5HTgO0DVZmiIg03erglq.png)

as the result: 

![](https://screenshots.wpmix.net/chrome_TwlnyfYU99U3i6vNQd3ioJDMG7AAvk9a.jpg) 

1. If this user tries to send only 2$ it requires only 1 input sign (because it's enough). 
2. But if the user try to send the entire balance it requires 8x more inputs. And the size of the transaction is higher than normal. 

# admin fee enabled (30% higher than normal)
If "admin fee" enabled on your wallet - it adds +1 OUTPUT bitcoin address (admin's) to every transaction. 

# user uses multisig or pin-protected wallet (+30% higher than normal, up to 10x if many small inputs to be signed)
2fa wallets (pin-protected) requires 1 extra signature for every input (from our authorization server) 


# What to do? 
Send transaction with 10 sat/byte (may takes 24h+ for confirmation)
