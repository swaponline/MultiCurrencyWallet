/**
 * @param {function} action
 * @param {number} delay
 * @returns {Promise<any>}
 */
const repeatAsyncUntilResult = (action, delay = 10 * 1000): Promise<any> =>
  new Promise(async (resolve) => {
    let isStoped = false
    const stop = () => {
      isStoped = true
    }
    const iteration = async () => {
      const result = await action(stop)

      if (!isStoped && (!result
        || result === 0
        || typeof result === 'undefined'
        || result === null
        || result === '0x0000000000000000000000000000000000000000')
      ) {
        setTimeout(iteration, delay)
      } else {
        resolve(result)
      }
    }

    iteration()
  })

/**
 * @param {number} inSeconds
 * @returns {Promise<any>}
 */
const waitDelay = async (inSeconds) => 
  new Promise(async (resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, inSeconds*1000)
  })

const extractSecretFromContract = async ({
  flow,
  swapFlow,
  participantAddress,
  ownerAddress,
  app,
}) => {
  try {
    let secretFromContract = await swapFlow.getSecret({
      participantAddress,
    })

    if (secretFromContract) {
      const {
        secretHash,
      } = flow.state

      const hashFromContractSecret = app.env.bitcoin.crypto.ripemd160(
        Buffer.from(secretFromContract.replace(/^0x/, ''), 'hex')
      ).toString('hex')

      if (hashFromContractSecret !== secretHash) {
        console.warn('Secret on contract dismatch with our hash. May be blockchain not updated. Try use swaps var')
        const ourSwap = await swapFlow.swaps({
          ownerAddress,
          participantAddress,
        })
        if (ourSwap) {
          const hashFromContractSwap = app.env.bitcoin.crypto.ripemd160(
            Buffer.from(ourSwap.secret.replace(/^0x/, ''), 'hex')
          ).toString('hex')

          if (hashFromContractSwap !== secretHash) {
            console.warn('Secret on contract dismatch with our hash. May be blockchain not updated')
          } else {
            console.warn('Use secret from contract swap variable. getSecret method stucked')
            secretFromContract = hashFromContractSwap
            return null
          }
        }
        return null
      }

      secretFromContract = `0x${secretFromContract.replace(/^0x/, '')}`

      return secretFromContract
    } else {
      return null
    }
  }
  catch (error) {
    return null
  }
}

const extractSecretFromTx = async ({
  flow,
  swapFlow,
  app,
  ethSwapWithdrawTransactionHash,
}) => {
  let secretFromTxhash = await repeatAsyncUntilResult(async () => {
    const {
      secret,
      secretHash,
    } = flow.state

    
    if (secret) {
      return secret
    } else {
     
      const secretFromTx = await swapFlow.getSecretFromTxhash(ethSwapWithdrawTransactionHash)

      const hashFromTxSecret = app.env.bitcoin.crypto.ripemd160(
        Buffer.from(secretFromTx, 'hex')
      ).toString('hex')

      if (hashFromTxSecret === secretHash) {
        return secretFromTx
      } else {
        console.warn('Secret from Tx dismatch with our hash. Wait contract')
        return false
      }
    }
  })
  //@ts-ignore
  secretFromTxhash = `0x${secretFromTxhash.replace(/^0x/, '')}`

  return secretFromTxhash
}


export default {
  repeatAsyncUntilResult,
  waitDelay,
  extractSecretFromContract,
  extractSecretFromTx,
}
