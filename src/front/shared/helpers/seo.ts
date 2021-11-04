const seo = {
  config: {
    medium: 'https://medium.com/@swaponline',
    twitter: 'https://twitter.com/SwapOnlineTeam',
    facebook: 'https://www.facebook.com/SwapOnlineTeam',
    telegram: 'https://t.me/swaponline',
    email: 'info@swaponline.io',
    mainUrl: 'https://swaponline.io',
    logo: 'https://wiki.swaponline.io/assets/swaponline_io.svg',
  },
  defaultTitle: 'Hot Wallet with Exchange',
  defaultDescription: 'Our online wallet with Atomic swap algorithms will help you store and exchange cryptocurrency instantly and more secure without third-parties. Decentralized exchange.',
  pages: [
    {
      uri: '/',
      title: window.defaultWindowTitle || 'Hot Wallet with Exchange',
      description: 'Our online wallet with Atomic swap algorithms will help you store and exchange' +
        ' cryptocurrency instantly and more secure without third-parties. Decentralized exchange.',
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
      title: 'Transactions',
      description: 'Transactions',
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
      description: 'Best exchange rate for Ethereum (ETH) to Bitcoin (BTC) atomic swap. Decentralized exchange of digital currencies with online wallet.',
      h1: 'Atomic Swap Ethereum (ETH) to Bitcoin (BTC) - Instant Exchange',
    },
    {
      uri: '/btc-eth',
      title: 'Atomic Swap Bitcoin (BTC) to Ethereum (ETH) Cross-Chain Exchange',
      description: 'Looking for best exchange rate to buy Ethereum (ETH) with Bitcoin (BTC)? Place your order on Swap.online to get the best rate.',
      h1: 'Atomic Swap Bitcoin (BTC) to Ethereum (ETH) - Decentralized Exchange',
    },
    //  Wallets.
    {
      uri: '/Ethereum-wallet',
      title: 'Ethereum Wallet with Atomic Swap (exchange)',
      description: 'Exchange Ethereum (ETH) & ERC20 token using Swap.Online (hot) wallet with built-in Atomic Swap exchange. (No fees, No registration or KYC)',
      h1: 'Your online Ethereum (ETH) web wallet with Atomic Swap.',
    },
    {
      uri: '/Bitcoin-wallet',
      title: 'Bitcoin (BTC) Web Wallet with Atomic Swap.',
      description: 'Swap.Online Bitcoin Wallet will allow you to exchange your coins using Atomic Swap technology.',
      h1: 'Your online Bitcoin (BTC) web wallet with Atomic Swap.',
      footer: ``,
    },
    {
      uri: '/USDT-wallet',
      title: 'Swap.Online - Tether (USDT) Web Wallet with Atomic Swap.',
      description: 'Atomic Swap web wallet allows you to store and exchange USDT to Bitcoin. Multi-currency wallet with a decentralized exchange (based on Atomic Swap technology)',
      h1: 'Your online Tether (USDT) wallet with Atomic Swap.',
    },
  ],
}

export const getSeoPage = uri => seo.pages.find(p => p.uri === uri)

export const getUrl = uri => `${seo.config.mainUrl}${uri}`

export default seo
