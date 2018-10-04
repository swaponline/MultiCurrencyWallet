import links from 'helpers/links'


export const initialState = {
  items: [
    {
      title: 'Wallet',
      link: links.home,
      exact: true,
      icon: 'wallet',
    },
    {
      title: 'Exchange',
      link: links.exchange,
      icon: 'exchange-alt',
    },
    {
      title: 'History',
      link: links.history,
      icon: 'history',
    },
    {
      title: 'Affiliate',
      link: links.affiliate,
      isMobile: false,
    },
    {
      title: 'Listing',
      link: links.listing,
      isMobile: false,
    },
  ],
  isDisplayingTable: false,
}

export const setIsDisplayingTable = (state, payload) => ({
  ...state,
  isDisplayingTable: payload,
})
