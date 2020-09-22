export ALICE=localhost:7777
export BOB=localhost:8888

export ORDER_ID=`curl $ALICE/me/orders | jq --raw-output '.[0].id'`

curl $ALICE/swaps/$ORDER_ID/refund | jq

curl $BOB/swaps/$ORDER_ID/refund | jq

curl -X DELETE $ALICE/orders/$ORDER_ID
