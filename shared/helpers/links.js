const linksManager = {
  home: '/',
  exchange: '/exchange',
  history: '/history',
  createWallet: '/createWallet',

  wallets: '/wallets',
  currencyWallet: '/wallet',
  swap: '/swaps',
  feed: '/feed',
  aboutUs: '/aboutUs',
  listing: 'https://listing.swap.online/',
  test: 'https://testnet.swap.online',
  main: 'https://swap.online/',
  ieo: '/IEO',
  wallet: '/wallet',
  oldWallet: 'oldWallet',
  coins: '/coins',
  partial: '/partial',
  notFound: '/NotFound',
  newPage: '/+NewPage',
  multisign: '/multisign',
  createInvoice: '/createinvoice',

  // social networks
  medium: 'https://medium.com/swaponline',
  twitter: 'https://twitter.com/SwapOnlineTeam',
  facebook: 'https://www.facebook.com/pg/Swaponline-637233326642691',
  telegram: 'https://t.me/swaponline',
  bitcointalk: 'https://bitcointalk.org/index.php?topic=4636633.0',
  discord: 'https://discordapp.com/invite/juG7UZH',
  reddit: 'https://www.reddit.com/r/SwapOnline',
  youtube: 'https://www.youtube.com/channel/UCCDWZob9wBsZUpScz2w9_lg',

  // footer links
  etherdelta: 'https://etherdelta.com/#0x14a52cf6b4f68431bd5d9524e4fcd6f41ce4ade9-ETH',
  button: 'https://wiki.swap.online/about-swap-online/#b2b',
  about: 'https://wiki.swap.online/about-swap-online/',
  extension: 'https://chrome.google.com/webstore/detail/swaponline/oldojieloelkkfeacfinhcngmbkepnlm',
  career: 'https://wiki.swap.online/careers-swap-online/',
  contacts: 'https://wiki.swap.online/contacts-swap-online/',
  concept: 'https://wiki.swap.online/en.pdf',
  description: 'https://docs.google.com/document/d/1MWrDR5pc3FB7AiWBO0GyBWBSci3VuDKNvknkPHtTzl8/edit#heading=h.tml4qc7dhie9',
  research: 'https://docs.google.com/spreadsheets/d/1qWFLK2y8oMH5Gfam-iwqXPzLtwNabzp_EL6QFxjSBc0/edit?usp=sharing',
  reuters: 'https://www.reuters.com/brandfeatures/venture-capital/article?id=37488',
  wiki: 'https://wiki.swap.online',
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
      link: 'https://wiki.swap.online/faq/#swap-faq-1',
    },
    {
      question: 'I don\'t see the Order, although the others can see it (or it can be seen from a different browser)',
      link: 'https://wiki.swap.online/faq/#swap-faq-2',
    },
    {
      question: 'Where are my private keys stored?',
      link: 'https://wiki.swap.online/faq/#swap-faq-3',
    },
    {
      question: 'Is KYC required?',
      link: 'https://wiki.swap.online/faq/#swap-faq-4',
    },
    {
      question: 'What swap pairs are available?',
      link: 'https://wiki.swap.online/faq/#swap-faq-5',
    },
    {
      question: 'Is there fee for trade?',
      link: 'https://wiki.swap.online/faq/#swap-faq-6',
    },
    {
      question: 'How much gas is being spent for swap?',
      link: 'https://wiki.swap.online/faq/#swap-faq-7',
    },
    {
      question: 'Min sum to trade?',
      link: 'https://wiki.swap.online/faq/#swap-faq-8',
    },
    {
      question: 'My swap got stuck and my Bitcoin has already been sent to the swap. What should I do?',
      link: 'https://wiki.swap.online/faq/#swap-faq-9',
    },
    {
      question: 'In what language is this written, and where I can find source code?',
      link: 'https://wiki.swap.online/faq/#swap-faq-10',
    },
    {
      question: 'Swap.Online token',
      link: 'https://wiki.swap.online/faq/#swap-faq-11',
    },
    {
      question: 'What is Swap.Button?',
      link: 'https://wiki.swap.online/faq/#swap-faq-12',
    },
    {
      question: 'Advantages of using the exchanger based on Swap.Online DEP',
      link: 'https://wiki.swap.online/faq/#swap-faq-13',
    },
    {
      question: 'Request is declined. Why?',
      link: 'https://swap.online/getting-started/#faq-item-5738',
      id: 'requestDeclimed',
    },
  ],
  // footer new links
  footer: {
    exchange : 'https://swap.online/exchange',
    wallet: 'https://swap.online',
    widget: 'https://widget.swap.online/',
    chromeextantion: 'https://chrome.google.com/webstore/detail/swaponline/oldojieloelkkfeacfinhcngmbkepnlm',
    forstablecoin: 'https://wiki.swap.online/for_stablecoins/',
    fordexses: 'https://wiki.swap.online/for_dexs/',
    forblockchains: 'https://wiki.swap.online/for_blockchains/',
    forerc20tokens: 'https://listing.swap.online/',
    fornewswebsites: 'https://widget.swap.online/',
    whitepaper: 'https://wiki.swap.online/en.pdf',
    wiki: 'https://wiki.swap.online/',
    github: 'https://github.com/swaponline',
    about: 'https://wiki.swap.online/about-swap-online/',
    agreements: 'https://drive.google.com/file/d/0Bz2ZwZCmFtj_Nm9qSm0tUm9Ia1kwVGhWRlVlVXRJTGZtYW5N/view?usp=sharing',
    privacypolicy: 'https://drive.google.com/file/d/1LdsCOfX_pOJAMqlL4g6DfUpZrGF5eRe9/view?usp=sharing',
    legal: 'https://drive.google.com/file/d/0Bz2ZwZCmFtj_WlNkY0ZYN0ZpNUo2VFVEeW9rWEVoTlNja0VZ/view?usp=sharing',
    contacts: 'https://wiki.swap.online/contacts-swap-online/',
    comparsion: 'https://docs.google.com/spreadsheets/d/1HVWjTKexfPjan_LFnCwMazEZTvcVtYl_3NWFKQ0L3ZM/edit?usp=drive_web&ouid=100012339553469619949',
    bankdashboard: 'https://wiki.swap.online/crypto_banking/',
    lnresearch: 'https://wiki.swap.online/lightninghack-berlin-june2018/',
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

export default linksManager
