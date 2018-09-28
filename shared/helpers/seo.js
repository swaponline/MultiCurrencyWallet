const seo = {
  config: {
    medium: 'https://medium.com/@swaponline',
    twitter: 'https://twitter.com/SwapOnlineTeam',
    facebook: 'https://www.facebook.com/SwapOnlineTeam',
    telegram: 'https://t.me/swaponlineint',
    email: 'info@swap.online',
    mainUrl: 'https://swap.online',
    logo: 'https://wiki.swap.online/assets/swap-logo.png',
  },
  pages: [
    {
      uri: '/',
      title: 'Swap.Online - Cryptocurrency Wallet with Atomic Swap Exchange',
      description: 'Our wallet with Atomic swap algorithms will help you store and exchange cryptocurrencies instantly and more secure without third-parties. Decentralized exchange.',
    },
    {
      uri: '/exchange',
      title: 'Exchange',
      description: 'Exchange',
    },
    {
      uri: '/exchange/btc',
      title: 'Bitcoin',
      description: 'Bitcoin',
      h1: 'Bitcoin Trade',
    },
    {
      uri: '/exchange/eth',
      title: 'Ethereum',
      description: 'Ethereum',
      h1: 'Ethereum Trade',
    },
    {
      uri: '/exchange/swap',
      title: 'Swap',
      description: 'Swap',
      h1: 'Swap Trade',
    },
    {
      uri: '/exchange/noxon',
      title: 'Noxon',
      description: 'Noxon',
      h1: 'Noxon Trade',
    },
    {
      uri: '/exchange/jot',
      title: 'Jot',
      description: 'Jot',
      h1: 'Jot Trade',
    },
    {
      uri: '/history',
      title: 'History',
      description: 'History',
    },
    {
      uri: '/affiliate',
      title: 'Affiliate',
      description: 'Affiliate',
    },
    {
      uri: '/listing',
      title: 'Listing',
      description: 'Listing',
    },
    {
      uri: '/swap',
      title: 'Swap',
      description: 'Swap',
    },
    {
      uri: '/feed',
      title: 'Feed',
      description: 'Feed',
    },
    {
      uri: '/eth-btc',
      title: 'Atomic Swap Ethereum (ETH) to Bitcoin (BTC) Decentralized Exchange',
      desctption: 'Best exchange rate for Ethereum (ETH) to Bitcoin (BTC) atomic swap. Decentralized exchange of digital currencies with online wallet.',
      h1: 'Atomic Swap Ethereum (ETH) to Bitcoin (BTC) - Instant Exchange',
    },
    {
      uri: '/btc-eth',
      title: 'Atomic Swap Bitcoin (BTC) to Ethereum (ETH) Cross-Chain Exchange',
      desctption: 'Looking for best exchange rate to buy Ethereum (ETH) with Bitcoin (BTC)? Place your order on Swap.online to get the best rate.',
      h1: 'Atomic Swap Bitcoin (BTC) to Ethereum (ETH) - Decentralized Exchange',
    },
    {
      uri: '/eos-btc',
      title: 'Atomic Swap EOS to Bitcoin (BTC) Instant Exchange',
      desctption: 'How to exchange EOS to BTC instantly and safely? Use Swap.Online service to exchange coins with atomic swap algorithm. ',
      h1: 'Best Exchange Rate EOS to Bitcoin (BTC) - Atomic Swap',
    },
    {
      uri: '/btc-eos',
      title: 'Atomic Swap Bitcoin (BTC) to EOS Instant Exchange',
      desctption: 'Atomic Swap Bitcoin (BTC) to EOS is the best way of exchanging cryptocurrencies decenralized. Swap.Online - Multi Currency Wallet.',
      h1: 'Best Exchange Rate Bitcoin (BTC) to EOS - Atomic Swap',
    },
  ],
}

export const getSeoPage = uri => seo.pages.find(p => p.uri === uri)

export const getUrl = uri => `${seo.config.mainUrl}${uri}`

export default seo
