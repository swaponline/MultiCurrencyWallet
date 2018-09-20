import React from 'react'

import styles from './Listing.scss'
import CSSModules from 'react-css-modules'
import ListingImg from './images/listing-screen.png'

import Href from 'components/Href/Href'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import PageHeadline from 'components/PageHeadline/PageHeadline'


const Listing = () => (
  <div styleName="container">
    <PageHeadline>
      <SubTitle>How to list your asset on swap.online?</SubTitle>
    </PageHeadline>
    <p>
      1. We can list your token on swap.online and it is absolutely free for now.  <br />
      2. To list your tokens, please send us the link to your peoject, erc20 address, icon, name and ticker (short name) to team@swap.online <br />
      3. We as well will announce listing of your tokens on our social media, mutial PR will benefit both sides. <br />
    </p>
    <p>Crypto Pink Sheets: ALL Coins Welcome To SWAP.Online!</p>
    <p>OTC-approach-crypto market to be opened in Aug, 2018.</p>
    <p>
      There was one company in the U.S. in the year of 1913, the National Quotation Bureau.
      They brought to life very simple idea - to provide every entity with the ability to be quoted freely, without
      complicated safety and control proceedings. The list of the bond orders was primarily published on the yellow
      paper and the stock orders were published on the pink paper. The Pink Sheets, as the lists were immediately
      called by the traders. rapidly became very popular among the market players. Every firm opened in the U.S.
      or abroad was able to publish its securities quotations in the list of Pink Sheets. With the increasing
      requirements of NYSE and NASDAQ and growing demands of the SEC to the information regarding the company
      applying the market, the interest to the Pink Sheets arose very fast. In September, 1990, the NQB introduced
      the real-time Electronic Quotation Service, so the over-the-counter trading entered the Internet. By the year
      2010 the operators of the Pink Sheets trading were acquisited by the OTC Market Group, Inc. In 2014, two of five
      U.S. stock trades were over-the-counter.
    </p>
    <p>Wal-Mart was the Pink Sheet company in 1972 and earned there USD 1B.</p>
    <p>
      Navistar International, the 12-billion-dollar-corporation, came to the Pink Sheets Market in 2006 leaving
      the NYSE due to some issues with the auditor board.
    </p>
    <p>
      In SWAP.Online we have noticed that Pink Sheets principles are very close to the initial meaning of cryptocurrencies.
      Both of them are based on the faith in transparency, decentralization, bilateral responsibility of buyer and seller.
      As we decided to make the exchange of crypto really
      <Href tab="https://wiki.swap.online/decentralised_exchanges_2018trends_eng/"> safe, rapid and decentralized</Href>, we couldn’t go about this another way.
    </p>
    <p>SWAP.Online will be cryptocurrency Pink Sheets market.</p>
    <img src={ListingImg} styleName="listingImg" alt="Orders book on swap.online" />
    <p>
      It’s well known that even in traditional stock market, one willing to be quoted must meet the requirements of SEC,
      or as far as the OTC Market Group Inc. markets (OTCQX and OTCQB) are concerned, must show the big income and seek the
      support of the influential consulting agencies. Moreover, the information about the company audit must be provided annually
      to the SEC or SEC-approved regulators.
    </p>
    <p>
      Some of the cryptocurrency ‘fat cats’ allow themselves to do the same. For example, Localbitcoins CEO said they would
      newer list a token of the project with less than USD1B capitalisation. Cryptobridge and some related centralized
      exchanges ask for the USD 23 thousand (in BTS equivalent) for the token owner to be listed.
    </p>
    <p>That is not about us. </p>
    <p>
      As our transactions is peer-to-peer, based on the Atomic Swaps technology, we can add to the balances every token corresponding
      some our criterias. Obviously, clearly fraudulent projects are to be rejected from the very beginning. But all other
      start-ups on the different stages of development are welcome.
    </p>
    <p>
      In contradiction to the widespread Ethereum-pegged exchanges, the main currency to be changed on tokens in our project is
      Bitcoin. It can be treated as our killer-feature: for the crypto-newbies and vast majority of small customers Bitcoin
      is much clearer and easy to buy via Localbitcoins etc.
    </p>
    <p>
      We offer two-level way of access to the balances. On the first stage, we analyze the level of project technical development,
      collect the basic information (name, ticker, logo) and add the token to trading balances.
    </p>
    <p>
      Then, to start trading with Bitcoin, the project should publish the information about the collaboration with SWAP.Online
      on every social platform and on the web-site forum. With this information published, our developers will release the final
      version of the exchange to client’s token. This option is available for the first ten projects only.
    </p>
    <p>The conditions of delisting are discussed, but at the moment, we plan to expel twenty per cent worst tokens every month.</p>
    <p>Thus, you token can start to be quoted in free and decentralized manner as quickly as possible for your unlimited profit.</p>
    <p>
      <strong>Stay with us.</strong> <br />
      <strong>Grow with us.</strong> <br />
      <strong>Earn with us.</strong> <br />
    </p>
  </div>
)

export default CSSModules(Listing, styles)
