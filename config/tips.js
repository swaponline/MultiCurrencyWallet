const tips = {
  loader: [
    'Do not forget to save your private keys!',
  ],
}

export const getRandomTip = sectionName => tips[sectionName][Math.floor(Math.random() * tips[sectionName].length)]

export default tips
