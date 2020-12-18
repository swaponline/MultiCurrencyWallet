## Risks associated with the Atomic Swap process
At the moment, the biggest risk is the inaccessibility of public nodes or spam of the blockchain. For example, let’s take such situation

1. Alice and Bob have frozen funds in smart contracts
2. Alice tries to withdraw funds from ethereum smart contract and sends the secret with a low gas price (the secret becomes visible to everyone)
3. Bob sees the transaction and starts a DoS attack in which he starts spamming ethereum ito prevent the transaction mining.
4. Bob withdraws BTC from a Bitcoin script (since the secret is already known)
5. After a timeout, Bob sends a refund transaction with an increased gas and withdraws ETH

Such attack makes sense when the amount of exchange is more than $ 10,000 (the minimum cost of gas). It also may happen accidentally

There may also be a risk that
1. The node will not accept a Bitcoin transaction for withdraw (transaction is too small or spam)
2. public node suddenly becomes unavailable

All these scenarios should be worked out by additional analysis of the state of all systems on which a successful swap depends.

### How to remove the risk:
Do not let the swap start if the nodes are unavailable, as well as be able to quickly switch nodes, replace the transaction if it is long mined, give the user an opportunity to complete the swap by manually sending the transaction manually.

## Risks associated with the orderbook.
Such risk assumes that an attacker can somehow start a swap with an unprofitable course for the victim. We check that the course during the swap coincides with the course in the order, but the atack process is not yet developed

What is planned to do: to audit the work of the order book,
1. check how it works in flood conditions.
2. check the possibility of exhibiting extremely large or extremely small exchange rate values

The risk of starting a swap but not completing it.
For example, lets consider such attack.
1. Alice places an order to sale ETH
2. Bob accepts it but does not freeze bitcoin, until timeout
3. Alice cannot start swap with others.

## Specific Sector Risks
There are many different types of risks associated with cryptocurrency. 

1. Fraud: The crypto space is still largely unregulated. This allows for unlawful projects to be launched in a quest to raise funds for a project which was never intended to deliver on any of its promises. In these instances contributors often lose 100% of their contribution. It is important to conduct thorough due diligence on all crypto projects. You should thoroughly research the team and advisory board behind all projects you’re interested in.Please be aware, that It’s often not enough to simply look at the profiles listed on the project’s website, as some fraudsters  have taken to using fake identities, fake social profile accounts and listing fake work histories and work experiences. In other cases, fraudsters have used real identities of people who are not associated with their project.

2. Hacks: While it is less likely a blockchain will be hacked, their is a greater potential for hacks on the system layers that exists above the blockchain layer. For example, applications such as wallets, browsers, websites or software programs are all all common targets for hackers. These hacks often lead to a substantial loss of funds for both the token issuer and the token purchaser. Please be aware that many blockchain projects are uninsured which will likely result in the complete loss of your funds in the event your the victim of a hack.

3. Project Abandonment: There is also a risk that some crypto projects could become abandoned. This may happen for a variety of reasons including but not limited to; lack of interest from the public or developers, unfavorable regulations, failures in technology or lack of funding. If a project becomes abandoned,the tokens associated with it will often become illiquid or void of any real value.

4. New technology: Many crypto projects found on our site use a blockchain as their underlying technology. Blockchain technology is relatively new which comes with it’s own risks. To make matters even riskier, many token issuers experiment with the underlying protocols and algorithms. In the blockchain space it’s not uncommon to see technology failures.

5. 3rd Party Underlying Protocol Failure: Many crypto projects execute their project on top of existing blockchains. Common blockchains include, but are not limited to, Bitcoin, Ethereum and NXT. Therefore, many crypto projects rely on the proper functioning of these underlying blockchains. However, issues such as forks, system failures, project abandonment or newer technologies such as quantum computing could introduce new risks for these underlying blockchains and therefore the projects built on top of them.

6. Mining Attacks: Early stage blockchain projects come with increased levels of risk. Blockchain protocols often use algorithms (such as Proof Of Work of Proof Of Stake) which help protect the network. While, these algorithms and others have proven to be quite secure, there is a risk with early stage projects which don’t have a balanced distribution of miners. In these instances a project could find themselves with miners who are bad actors and could engage in activity, such as majority mining power attacks, that would reduce the value of the platform or network to zero.

7. Extreme Volatility: Crytocurrencies have traditionally been incredibly volatile assets. This has many implications for the ICO and Token Sale industry. The value of a project’s internal token may or may not lead to increase or decreases in project progress as well as public interest in the project. Similarly, the price of the tokens used as the base currency (for fundraising) could also depreciate in value meaning the token issuer may not have the funds to complete the project.

8. Lack of verifiable 3rd Party Audits: Token sales are often not designed as securities sales and therefore they often are not subject to the same rigorous third party verification and auditing standards.

9. Accidental Loss of Tokens: It is possible to lose the entire balance of your token based on many different factors. For example, if you fail to follow the exact ICO or Token Sale instructions, including providing a correct and compatible receiving address you may lose your tokens. You may also lose your tokens if you fail to write down your password, private key or passphrase (depending on the rules of each token sale). Generally, failing to follow very strict guidelines will result in the total loss of all tokens. In the majority of these cases the tokens will be forever unrecoverable.

10. Regulatory Risk: There is a risk that a crypto project either failed to adhere to regulatory requirements for their specific use case and technology, or new laws or regulation may conflict with their current project functioning. It’s also important to realize that regulatory standards and laws change greatly between jurisdictions. It’s important to study, understand and constantly update yourself on the rapidly changing regulatory landscape surrounding blockchain technology and ICOs in your jurisdiction.

11. Internal Team Errors or Failures: There is a risk associated with putting control of the day to day operations in the hands of the token issuer. Token price,stability and utility are often grounded in the principles of good business management. However, there is a risk that central management will fail to run the business properly.

12. No Legal Recourse: There is a risk associated with finding a reasonable legal remedy in the case of a dispute. it may be difficult or costly for token contributors to assert their legal right. Due to the international nature of the internet, and global commerce contributors may find it expensive or difficult to challenge the token issuer in their jurisdiction. Similarly, crypto projects often explicitly state the risks in their terms and conditions. This can make finding a reasonable legal remedy challenging.
