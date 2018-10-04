const tips = {
  loader: [
    'Do not forget to save your private keys!',
    '"Wow, this is awesome!" – @dexx7y Maintainer of Omni Core about our USDT swaps',
    '"That is great news" – Roger Ver, CEO of bitcoin.com, about connecting Bitcoin Cash to swap.online'
  ],
}

export const getRandomTip = sectionName => tips[sectionName][Math.floor(Math.random() * tips[sectionName].length)]

export default tips
