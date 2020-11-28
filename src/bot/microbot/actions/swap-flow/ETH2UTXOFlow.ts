import _debug from 'debug'


const debug = _debug('swap.bot')

const tryAcceptWithdrawRequest = (swap) => {
  const { withdrawRequestIncoming, withdrawRequestAccepted } = swap.flow.state

  if (withdrawRequestIncoming && !withdrawRequestAccepted) {
    debug('accept withdraw request')

    swap.flow.acceptWithdrawRequest()
  }
}

export default (swap) => {
  const { step } = swap.flow.state

  switch (swap.flow.state.step) {
    case 1:
      swap.flow.sign()
      return
    case 3:
      swap.flow.verifyScript()
      return
    case 4:
      swap.flow.syncBalance()
      return
    default:
      tryAcceptWithdrawRequest(swap)
  }

  return swap
}
