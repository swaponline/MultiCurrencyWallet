# Feedback

Feedback helps developers understand the popularity of features and apply efforts in the right direction to improve user experience.

Feedback does not contain sensitive information.


## Message send example

```
import feedback from 'shared/helpers/feedback'
...
feedback.app.started()
...
feedback.createOffer.started()
...
feedback.createOffer.finished(`BTC->ETH`)
```

## Output message format (easy to parse)

`[host] appPart - eventName {details} |`


## Output message examples

```
[swaponline.io] app - started
[swaponline.io] createOffer - started
[swaponline.io] createOffer - finished {BTC->ETH}
```

## How to disable

`/src/front/shared/helpers/feedback.js`

`const isFeedbackEnabled = false`
