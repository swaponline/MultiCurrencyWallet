import config from 'app-config'
import web3 from './web3'


const isValidReputationProof = (participantMetadata) => {
  const oracleMessage = JSON.stringify({
    address: participantMetadata.address,
    reputation: participantMetadata.reputation,
  })
  const oracleMessageHash = web3.utils.soliditySha3(oracleMessage)
  const oracleAddress = web3.eth.accounts.recover(oracleMessageHash, participantMetadata.reputationProof)

  if (oracleAddress !== config.swapContract.reputationOracle) {
    return false
  }

  return true
}

const getVerifiedReputation = (participantMetadata) =>
  isValidReputationProof(participantMetadata) ? participantMetadata.reputation : 0

export default { getVerifiedReputation }
