
const metamaskProvider = (window.ethereum) || false





export default {
  enabled: !(!metamaskProvider),
}