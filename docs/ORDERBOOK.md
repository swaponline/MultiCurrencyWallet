# How the P2P orderbook works

**Order** - is a public announcement about the fact that user is ready to exchange cryptocurrency X for the cryptocurrency Y.

**Orderbook** - is the effective lists of orders used by users to find each other and exchange cryptocurrencies promptly.

On both centralized and semi-decentralized exchanges (e.g. IDEX) orderbook is stored on the basic server. Thus, the server owner is responsible for the matching between buyers and sellers, similarly to the owners of torrent-trackers.

So, the decentralized orderbook addresses the elimination of the administrator’s influence on the exchange processes and on online order matching.
We have solved this problem via the ipfs pubsub library means.

<img class="wp-image-5890 aligncenter" src="https://wiki.swap.online/wp-content/uploads/2019/05/Kartinka-1-alisa-i-bob.png" alt="" width="635" height="243" />


## So, how does it work?

1. We launch the ipfs library and ipfs-pub-sub-room (<a href="https://github.com/ipfs-shipyard/ipfs-pubsub-room#use">https://github.com/ipfs-shipyard/ipfs-pubsub-room#use</a> )

2. We set external public signal server to find the first peer in network (<a href="https://github.com/swaponline/swap.react/blob/master/config/mainnet/ipfs.js">https://github.com/swaponline/swap.react/blob/master/config/mainnet/ipfs.js</a> )

3. User comes and gets connected to some other users. Imagine, they are in the same chat room. This information is shown in the bottom of the page.

<img class="wp-image-5906 aligncenter" src="https://wiki.swap.online/wp-content/uploads/2019/05/Kartinka-2-peers-online.png" alt="" width="603" height="92" />

4. User sends the order via the interface.

5. The order is formed and sent through the libp2p library here (<a href="https://github.com/swaponline/swap.core/blob/master/src/swap.orders/SwapOrders.js#L317">https://github.com/swaponline/swap.core/blob/master/src/swap.orders/SwapOrders.js#L317</a>).

<img class="wp-image-5922 aligncenter" src="https://wiki.swap.online/wp-content/uploads/2019/05/Kartinka-3-room.png" alt="" width="648" height="479" />

6. Every message is signed by the private key from the Ethereum network and then checked through web3.ecrecover (<a href="https://github.com/swaponline/swap.core/blob/master/src/swap.room/SwapRoom.js#L174">https://github.com/swaponline/swap.core/blob/master/src/swap.room/SwapRoom.js#L174</a>)

7. Swap.online dApp receives the avaliable orders and shows it to the users.

<img class="wp-image-5938 aligncenter" src="https://wiki.swap.online/wp-content/uploads/2019/05/Kartinka-4-ordera.png" alt="" width="570" height="289" />

8. Moreover, this orderbook is analyzed during the exchange via the simplified interface, where the user enters only the sum for exchange and gets the request with the most profitable order

<img class="wp-image-5954 aligncenter" src="https://wiki.swap.online/wp-content/uploads/2019/05/Kartinka-5-gifka.gif" alt="" width="594" height="655" />


## Messages

Full range of messages transferred via the IPFS system:

- ready
- user online
- user offline
- new orders
- new order
- remove order
- hide orders
- show orders
- accept request
- decline request
- request swap
- new order request
- accept swap request
- request partial fulfilment
- accept partial fulfilment
- decline partial fulfilment
- new partial fulfilment request

and some messages inside the swap.