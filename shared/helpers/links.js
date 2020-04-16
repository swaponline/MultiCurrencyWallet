import actions from '../redux/actions'


const linksManager = {
  home: '/',
  hashHome: '#/',
  exchange: '/exchange',
  pointOfSell: '/buy',
  history: '/history',
  createWallet: '/createWallet',

  wallets: '/wallets',
  send: '/withdraw',
  currencyWallet: '/wallet',
  swap: '/swaps',
  feed: '/feed',
  aboutUs: '/aboutUs',
  listing: 'https://listing.swaponline.io/',
  test: 'https://testnet.swaponline.io',
  main: 'https://swaponline.io/',
  ieo: '/IEO',
  wallet: '/wallet',
  coins: '/coins',
  partial: '/partial',
  notFound: '/NotFound',
  newPage: '/+NewPage',
  multisign: '/multisign',
  createInvoice: '/createinvoice',
  BchWallet: '/BitcoinCash-wallet',
  BtcWallet: '/Bitcoin-wallet',
  EthWallet: '/Ethereum-wallet',

  // social networks
  medium: '#',
  twitter: 'https://twitter.com/SwapOnlineTeam',
  facebook: '#',
  telegram: 'https://t.me/swaponline',
  bitcointalk: '#',
  discord: '#',
  reddit: '#',
  youtube: '#',

  // footer links
  etherdelta: 'https://etherdelta.com/#0x14a52cf6b4f68431bd5d9524e4fcd6f41ce4ade9-ETH',
  button: 'https://wiki.swaponline.io/about-swap-online/#b2b',
  about: 'https://wiki.swaponline.io/about-swap-online/',
  extension: 'https://chrome.google.com/webstore/detail/swaponline/oldojieloelkkfeacfinhcngmbkepnlm',
  career: 'https://wiki.swaponline.io/careers-swap-online/',
  contacts: 'https://wiki.swaponline.io/contacts-swap-online/',
  concept: 'https://wiki.swaponline.io/en.pdf',
  description: 'https://docs.google.com/document/d/1MWrDR5pc3FB7AiWBO0GyBWBSci3VuDKNvknkPHtTzl8/edit#heading=h.tml4qc7dhie9',
  research: 'https://docs.google.com/spreadsheets/d/1qWFLK2y8oMH5Gfam-iwqXPzLtwNabzp_EL6QFxjSBc0/edit?usp=sharing',
  reuters: 'https://www.reuters.com/brandfeatures/venture-capital/article?id=37488',
  wiki: 'https://wiki.swaponline.io',
  github: 'https://github.com/swaponline',
  githubButton: 'https://github.com/swaponline/swap.button',
  bitcointalkSendTx: 'https://bitcointalk.org/index.php?topic=1938621.0',
  privacyPolicy: 'https://drive.google.com/file/d/1LdsCOfX_pOJAMqlL4g6DfUpZrGF5eRe9/view?usp=sharing',
  privacyPolicyDoc: 'https://drive.google.com/file/d/0Bz2ZwZCmFtj_N29fQVk4bV9tUXRscjFEcUkxVkFXdF9tY0ow/view?usp=sharing',
  terms: 'https://drive.google.com/file/d/0Bz2ZwZCmFtj_Nm9qSm0tUm9Ia1kwVGhWRlVlVXRJTGZtYW5N/view?usp=sharing',
  legalOpinion: 'https://drive.google.com/file/d/0Bz2ZwZCmFtj_WlNkY0ZYN0ZpNUo2VFVEeW9rWEVoTlNja0VZ/view?usp=sharing',
  licence: 'https://www.teatmik.ee/en/personlegal/14477421-Swap-Online-O%C3%9C',
  faq: [
    {
      question: 'What is the price of SWAP token?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-1',
    },
    {
      question: 'I don\'t see the Order, although the others can see it (or it can be seen from a different browser)',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-2',
    },
    {
      question: 'Where are my private keys stored?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-3',
    },
    {
      question: 'Is KYC required?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-4',
    },
    {
      question: 'What swap pairs are available?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-5',
    },
    {
      question: 'Is there fee for trade?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-6',
    },
    {
      question: 'How much gas is being spent for swap?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-7',
    },
    {
      question: 'Min sum to trade?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-8',
    },
    {
      question: 'My swap got stuck and my Bitcoin has already been sent to the swap. What should I do?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-9',
    },
    {
      question: 'In what language is this written, and where I can find source code?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-10',
    },
    {
      question: 'Swap.Online token',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-11',
    },
    {
      question: 'What is Swap.Button?',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-12',
    },
    {
      question: 'Advantages of using the exchanger based on Swap.Online DEP',
      link: 'https://wiki.swaponline.io/faq/#swap-faq-13',
    },
    {
      question: 'Request is declined. Why?',
      link: 'https://swap.online/getting-started/#faq-item-5738',
      id: 'requestDeclimed',
    },
  ],
  // footer new links
  footer: {
    exchange: 'https://swap.online/exchange',
    wallet: 'https://swap.online',
    widget: 'https://widget.swap.online/',
    chromeextantion: 'https://chrome.google.com/webstore/detail/swaponline/oldojieloelkkfeacfinhcngmbkepnlm',
    forstablecoin: 'https://wiki.swaponline.io/for_stablecoins/',
    fordexses: 'https://wiki.swaponline.io/for_dexs/',
    forblockchains: 'https://wiki.swaponline.io/for_blockchains/',
    forerc20tokens: 'https://listing.swap.online/',
    fornewswebsites: 'https://generator.swaponline.site/generator/',
    whitepaper: 'https://wiki.swaponline.io/en.pdf',
    wiki: 'https://wiki.swaponline.io/',
    github: 'https://github.com/swaponline',
    about: 'https://wiki.swaponline.io/about-swap-online/',
    agreements: 'https://drive.google.com/file/d/0Bz2ZwZCmFtj_Nm9qSm0tUm9Ia1kwVGhWRlVlVXRJTGZtYW5N/view?usp=sharing',
    privacypolicy: 'https://drive.google.com/file/d/1LdsCOfX_pOJAMqlL4g6DfUpZrGF5eRe9/view?usp=sharing',
    legal: 'https://drive.google.com/file/d/0Bz2ZwZCmFtj_WlNkY0ZYN0ZpNUo2VFVEeW9rWEVoTlNja0VZ/view?usp=sharing',
    contacts: 'https://wiki.swaponline.io/contacts-swap-online/',
    comparsion: 'https://docs.google.com/spreadsheets/d/1HVWjTKexfPjan_LFnCwMazEZTvcVtYl_3NWFKQ0L3ZM/edit?usp=drive_web&ouid=100012339553469619949',
    bankdashboard: 'https://wiki.swaponline.io/crypto_banking/',
    lnresearch: 'https://wiki.swaponline.io/lightninghack-berlin-june2018/',
  },
}




linksManager.getFaqLink = (faqID) => {
  for (let i = 0; i < linksManager.faq.length; i++) {
    if (linksManager.faq[i].id
      && (linksManager.faq[i].id === faqID)
    ) {
      return linksManager.faq[i].link
    }
  }
  return false
}

export const getBitcoinWallet = () => {
  const { address } = actions.user.getAuthData('btc')

  return `/btc/${address}`
}

export const getEtherWallet = () => {
  const { address } = actions.user.getAuthData('eth')

  return `/eth/${address}`
}

export const getTokenWallet = (token) => {
  const { address } = actions.user.getAuthData('eth')

  return `/token/${token.toUpperCase()}/${address}`
}

window.getTokenWallet = getTokenWallet

export const getFullOrigin = () => `${location.origin}${location.pathname}#`


export default linksManager;

