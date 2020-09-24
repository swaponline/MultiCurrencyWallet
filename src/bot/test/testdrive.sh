export ALICE=localhost:7777
export order=`cat order.example`

echo "$order"

curl -X DELETE $ALICE/orders/all
curl -H "Content-Type: application/json" -X POST --data "$order" $ALICE/orders

sleep .5

# curl $ALICE/me/orders | jq

export PEER_ID=`curl $ALICE/me | jq --raw-output '.wallet.peer'`

echo $PEER_ID

export BOB=localhost:8888
export BOB_PEER_ID=`curl $BOB/me | jq --raw-output '.wallet.peer'`

echo $BOB_PEER_ID

export ORDER_ID=`curl $ALICE/orders/search?isProcessing=false\&peer=$PEER_ID | jq --raw-output '.[].id'`

echo $ORDER_ID


curl $ALICE/me | jq
curl $BOB/me | jq

curl $BOB/orders | jq

echo Begin at timestamp $(($(date +%s)+5))
echo Wait 5 seconds...
sleep 5

curl $BOB/orders/$ORDER_ID/request | jq

sleep 2

curl $ALICE/orders/$ORDER_ID/accept/$BOB_PEER_ID | jq

echo $ALICE/orders/$ORDER_ID/accept/$BOB_PEER_ID

sleep 5
echo start swapping
curl $ALICE/swaps/$ORDER_ID/go | jq '.flow'
curl $BOB/swaps/$ORDER_ID/go | jq '.flow'

# sleep 5
# # NOXON2BTC
# echo sign
# curl $BOB/swaps/$ORDER_ID/sign | jq '.flow'
#
# sleep 5
# # BTC2NOXON
# echo submit secret
# curl $ALICE/swaps/$ORDER_ID/submit-secret | jq '.flow'
#
# sleep 5
#
# echo verify btc script
# curl $BOB/swaps/$ORDER_ID/verify-btc-script | jq '.flow'

echo $ALICE/swaps/$ORDER_ID/
echo $ALICE/swaps/$ORDER_ID/try-withdraw?secret=
