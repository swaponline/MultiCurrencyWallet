## Name

The name of the commit, branch and PR are some of the most important things.


## Simple and to the point

The name of the PR is good to start with the module where there were changes. For instance,

- Exchange: dropdown switches, when selecting another currency (no BTC-BTC)
- Orderbook: toggle to show only partial orders
- Wallet: mobile view show / hide control buttons on tap
- History: add column swap start time

The title should be in the space of the problem, not in the space of the solution. It is better to write not about what was done with the code - for this there is a tab `Files changed` - but about why.

Anti-examples:

* fix new order button
* sort orders by price
* run updateBalance on mount

It's better:

* new order button creates one order instead of two
* orders with lowest price show up on top of table
* withdraw modal had old balance, now checks when opened

If it is difficult to come up with a name for a commit, then first answer the question, why upload this code to the site at all?

A handy trick: write the name of the commit before you start working on it. Then there is less desire to be distracted and better understanding of what needs to be achieved.

This brings us to the next point:


## Code culture

The set of changes should not contain commits and changes that are not related to the name of the commit.

The history of code changes is almost more important than the code itself. It's cool when the application has a good architecture, and when it's convenient to look at the changes and look for which commit added this bug, it's even cooler.

We all love refactoring, but let's respect each other. If the wrong spaces are so annoying, move them all to a separate branch and make a PR with these changes. I myself notice these desires, but I try to restrain myself.

Why is that bad?

- Such changes really carry the risk of unnecessary bugs
- Such PRs are more difficult to check: it is not clear what this change is: functionality or just a correction of commas?
- If some commit or function adds a bug and needs to be rolled back, then all these "useful changes" are rolled back with it. In general, the version control system is needed for this: to roll back changes.
- Usually you notice and fix only one file. As a result, one file in the project becomes with the correct formatting, and the rest remain with the wrong one, so it's even worse.


## Testing

Run the code you added at least once.

There is a bunch of code in the project that no one has ever run, and that just doesn't work. This is a disrespect for the reviewer, who will have to look for bugs in the initially untested code, and for processor cycles.

I'm not even talking about autotests: run it manually at least once and check that this `if (value ===" false ")` really does what you intended.


## Record video

If you run it anyway, record a video. For example, via [Screencastify] (https://chrome.google.com/webstore/detail/screencastify-screen-vide/mmeijimgabbpbgpdklnllpncmdofkcpn?hl=en).


### How to check?

Write a test guide for the reviewer.

I open a pull request, what should I look at and where to check ?.

For example, `Check the creation and deletion of an order.`


### Check a second time

If the Merge pull request button was already green, consider whether it can be clicked? What will the reviewer answer when it reads the code? Maybe you already know what needs to be fixed, but haven't thought about it? Think now.

### Working with tasks from clients

- if the task is duplicated, you need to find the original one, and on this put a duplicate and a link to the original
- if the task has already been done, add a link to the pull request, but just check and unsubscribe what has been checked (how exactly did you check it? maybe the client checked it differently)
