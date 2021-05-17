на основе https://github.com/johngrantuk/todoDapp/blob/fcf586a113b693bec9b2ae40ce1b358cda0b1fcf/client/src/App.test.js
```
docker build tests/e2e -t pp1

docker run --shm-size 1G --rm -v /root/MultiCurrencyWallet/e2e:/app pp1
```

в  /root/MultiCurrencyWallet/e2e/screenshots появятся скриншоты 

![](https://screenshots.wpmix.net/ApplicationFrameHost_xoaEin8fasAlps7hRpXEmcXQmPOTAPbY.png)
