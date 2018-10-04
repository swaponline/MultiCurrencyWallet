import reducers from '../core/reducers'


const fetchFaq = async () => {
  // reducers.info.setFaq({ faq: { items: [], fetching: true } })
  // const items = await request.get('https://wiki.swap.online/wp-json/swap/faq/')
  // reducers.info.setFaq({ faq: { items, fetching: false } })
  reducers.info.setFaq(
    {
      faq: {
        items: [
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
        ],
      },
    },
  )
}

export default {
  fetchFaq,
}
