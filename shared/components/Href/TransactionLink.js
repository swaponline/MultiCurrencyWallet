import Href from 'components/Href/Href'

export default ({ type, id, testnet }) => {
  let link = '#'

  if (testnet === true) {
    switch (type) {
      case 'BTC':
        link = `https://www.blocktrail.com/tBTC/tx/${id}`

      case 'ETH':
        link = `https://rinkeby.etherscan.io/tx/${id}`

      case 'EOS':
        link = `#`
    }
  }

  return (
    <div>
      Transaction: <strong><Href tab={link} rel="noopener noreferrer">{id}</Href></strong>
    </div>
  )
}