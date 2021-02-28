## Developer Program

To let and motivate anyone JS, React, Typescript developers and QA to contribute in our codebase we pay in SWAP tokens for commits and issues. If you are willing to receive experience in your area see below

SWAP token is NOT a money, no guarantee you will exchange this to visa, paypal, USD, BTC, ETH or whatever), we never will buy SWAP tokens from you. Read more what is this here https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/SWAPTOKEN.md

| Time working on our codebase (Level)                         | SWAP per hour |
|--------------------------------------------------------------|-----------------------------|
| Volunteer (less than 3 pull requests)                        | 1 SWAP per hour             |
| Junior (can change interface, wallet)                        | 5 SWAP per hour             |
| Middle (can add new blockchain to wallet)                    | 10 SWAP per hour            |
| Senior (can add new blockchain to atomic swap)               | 15 SWAP per hour            |
| Lead (can reduce codebase, make app more developer friendly) | 20 SWAP per hour            |

Q: why don't you pay in USD or btc? <br>
A: we don't have a revenue in USD to pay new developers

How to Contribute:
1. find or create issue
2. make pullrequest with following instructions:

### Name of Pull Request (PR)

The name of the commit, branch and PR are some of the most important things.


### Short and Simple

The name of the PR is good to start with the module where there were changes. For instance,

- Exchange: dropdown switches, when selecting another currency (no BTC-BTC)
- Orderbook: toggle to show only partial orders
- Wallet: mobile view show / hide control buttons on tap
- History: add column swap start time

The title should be in the space of the problem, not in the space of the solution. It is better to write not about what was done with the code - for this there is a tab `Files changed` - but about why.

Bad Examples:

* fix new order button
* sort orders by price
* run updateBalance on mount

Good Examples:

* new order button creates one order instead of two
* orders with lowest price show up on top of table
* withdraw modal had old balance, now checks when opened

If it is difficult to come up with a name for a commit, then first answer the question, why upload this code to the site at all?

A handy trick: write the name of the commit before you start working on it. Then there is less desire to be distracted and better understanding of what needs to be achieved.

This brings us to the next point:

### Testing

Run the code you added at least once.

There is a bunch of code in the project that no one has ever run, and that just doesn't work. This is a disrespect for the reviewer, who will have to look for bugs in the initially untested code, and for processor cycles.

I'm not even talking about autotests: run it manually at least once and check that this `if (value ===" false ")` really does what you intended.


### Record Video

If you run it anyway, record a video. For example, via [Screencastify](https://chrome.google.com/webstore/detail/screencastify-screen-vide/mmeijimgabbpbgpdklnllpncmdofkcpn?hl=en).


### How to Check?

Write a test guide for the reviewer.

I open a pull request, what should I look at and where to check ?

For example, `Check the creation and deletion of an order.`


### Double Check

If the Merge pull request button was already green, consider: can it be clicked? What will the reviewer answer when it reads the code? Maybe you already know what needs to be fixed, but haven't thought about it? Think now.

### Working with tasks from clients

- if the task is duplicated, you need to find the original one, and on this put a duplicate and a link to the original
- if the task has already been done, add a link to the pull request, but just check and unsubscribe what has been checked (how exactly did you check it? maybe the client checked it differently)
