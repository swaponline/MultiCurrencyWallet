const seo = {
  config: {
    medium: 'https://medium.com/@swaponline',
    twitter: 'https://twitter.com/SwapOnlineTeam',
    facebook: 'https://www.facebook.com/SwapOnlineTeam',
    telegram: 'https://t.me/swaponlineint',
    email: 'info@swap.online',
    mainUrl: 'https://swap.online',
    logo: 'https://wiki.swap.online/wp-content/uploads/2018/04/logo-1.png',
  },
  pages: [
    {
      uri: '/',
      title: 'Swap.Online - Cryptocurrency Wallet with Atomic Swap Exchange',
      description: 'Atomic swap algorithms will help you to exchange cryptocurrencies instantly in a more secure way exluding third-parties. Decentralized exchange.',
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
      h1: 'Bitcoin Trade'
    },
    {
      uri: '/exchange/eth',
      title: 'Ethereum',
      description: 'Ethereum',
      h1: 'Ethereum Trade'
    },
    {
      uri: '/exchange/swap',
      title: 'Swap',
      description: 'Swap',
      h1: 'Swap Trade'
    },
    {
      uri: '/exchange/noxon',
      title: 'Noxon',
      description: 'Noxon',
      h1: 'Noxon Trade'
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
  ],
}

export const getSeoPage = uri => seo.pages.find(p => p.uri === uri)

export const getUrl = uri => `${seo.config.mainUrl}${uri}`

export default seo
