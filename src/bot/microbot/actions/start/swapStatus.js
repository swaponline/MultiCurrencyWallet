const defaultLockTime = 60 * 60 * 3

// Date.now() gives ms
const utcNow = () => Math.floor(Date.now() / 1000)

const lockTimePassed = (btcLockTime, period = defaultLockTime) => {
  //     |     --- 3 hours ---    BTC locktime
  //   created                           |
  //     |  + period ------|             |
  //     |                 |             |
  //     |                 |             |
  //     |         now     |             |
  //     v          v      v             v
  // –––––––––––––––––––––––––––––––––––––––––––––––

  const created = btcLockTime - defaultLockTime
  const now = utcNow()

  return now > created + period
}

export const needsRefund = (swap) => {
  const { id } = swap

  const { state } = swap.flow

  const { step, btcScriptValues, isFinished, isRefunded, isStoppedSwap } = state

  console.log(new Date().toISOString(), `swap`, id, `step`, step)

  if (step <= 2) {
    return false
  }

  if (!btcScriptValues) {
    return false
  }

  if (isFinished) {
    return false
  }

  if (isRefunded) {
    return false
  }

  if (isStoppedSwap) {
    return false
  }

  const { lockTime } = btcScriptValues
  const [ head, base ] = swap.flow._flowName.split('2')

  if (head === 'BTC') { // ['BTC','BCH','USDT'].includes(head)) {
    // BTC to _ETH_

    const { btcScriptCreatingTransactionHash } = state

    if (!btcScriptCreatingTransactionHash) {
      console.error(new Date().toISOString(), `Unknown creating tx hash`)
    } else {
      console.error(new Date().toISOString(), `Found tx hash: ${btcScriptCreatingTransactionHash}`)
    }

    const { scriptAddress } = state

    if (scriptAddress) {
      console.error(new Date().toISOString(), `Found script address: ${scriptAddress}`)
    }

    return lockTimePassed(lockTime, defaultLockTime)
  }

  if (base === 'BTC') { // (['BTC','BCH','USDT'].includes(base)) {
    //  _ETH_ to BTC

    const { ethSwapCreationTransactionHash } = state

    if (!ethSwapCreationTransactionHash) {
      console.error(new Date().toISOString(), `Unknown creating tx hash`)
    } else {
      console.error(new Date().toISOString(), `Found tx hash: ${ethSwapCreationTransactionHash}`)
    }

    // ETH locktime is 1 hour.

    return lockTimePassed(lockTime, defaultLockTime)
  }

  throw new Error(`Unknown flow type: ${swap.flow._flowName}`)

}

export const canBeDeleted = async swap => {
  const { state } = swap.flow

  const isParticipantOnline = swap.room.getOnlineParticipant()

  const { step, btcScriptValues, isFinished, isRefunded, isStoppedSwap } = state

  const lifeTimeout = swap.checkTimeout(defaultLockTime)

  const neverStarted = step <= 2 && !isParticipantOnline && lifeTimeout

  if (isRefunded) {
    const RefundIsSuccess = await swap.flow.isRefundSuccess()
    if (!RefundIsSuccess) {
      console.log(new Date().toISOString(), `[SWAP ${swap.id}]: isRefunded=true, but TX id is not correct.`)
      return false
    } else {
      console.log(new Date().toISOString(), `[SWAP ${swap.id}]: isRefunded=true, probably can be deleted, needs manual interference`)
    }
  }

  return isFinished || neverStarted || isRefunded || isStoppedSwap
}

export default (swap) => {
  return needsRefund(swap)
}
