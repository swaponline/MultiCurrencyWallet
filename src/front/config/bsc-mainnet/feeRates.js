import api from './api'

export default {
  eth: `https://api.bscscan.com/api?module=proxy&action=eth_gasPrice&apikey=${api.etherscan_ApiKey}`,
  btc: 'https://wiki.swaponline.io/blockcyper.php',
}
