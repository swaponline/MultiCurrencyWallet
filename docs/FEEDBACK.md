# Feedback

Feedback helps developers understand the popularity of features and apply efforts in the right direction to improve user experience.

Feedback does not contain sensitive information.


## Message creation example

```
import feedback from 'shared/helpers/feedback'
...
feedback.createOffer.started()
...
feedback.createOffer.finished(`BTC->ETH`)
```

## Output message format (easy to parse)

```
[host] appPart - eventName {details}
```


## Output message examples

```
[swaponline.io] app - started
[swaponline.io] app - otherTabsClosed
[swaponline.io] app - closed

[swaponline.io] faq - opened {What are the fees involved?}

[swaponline.io] banner - clicked {How we...}

[swaponline.io] createWallet - started
[swaponline.io] createWallet - finished {BTC-normal}

[swaponline.io] backup - started
[swaponline.io] backup - finished

[swaponline.io] withdraw - started
[swaponline.io] withdraw - finished {BTC}

[swaponline.io] exchangeForm - flipped
[swaponline.io] exchangeForm - selectedCurrencyFrom {BTC}
[swaponline.io] exchangeForm - selectedCurrencyTo {ETH}
[swaponline.io] exchangeForm - selectedAddressFrom {External}
[swaponline.io] exchangeForm - selectedAddressTo {Internal}
[swaponline.io] exchangeForm - swapStarted

[swaponline.io] createOffer - started
[swaponline.io] createOffer - finished {BTC->ETH}

[swaponline.io] offers - offerDeleted
[swaponline.io] offers - offerShared
[swaponline.io] offers - buyPressed {BTC->ETH}
[swaponline.io] offers - swapStarted {BTC->ETH}

[swaponline.io] i18n - switched {NL}

[swaponline.io] tooltip - showed {...}

```

## How to disable

`/src/front/shared/helpers/feedback.js`

`const isFeedbackEnabled = false`
