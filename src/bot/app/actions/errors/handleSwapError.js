export default (swap, { name, message, ...other }) => {
  if (/exists/.test(message)) {
    const { owner, participant } = swap
    console.log(new Date().toISOString(), `[${swap.id}]: swap {${participant.eth.address}, ${owner.eth.address}} exists`)

    if (!swap.flow.state.isRefunded) {
      swap.flow.tryRefund()
    }
  }

  console.error(name, message, other)
}
