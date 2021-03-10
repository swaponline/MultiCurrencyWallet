const removeSwap = (swap) => {
  // add to Swap methods
  if (!swap || !swap.update) return

  return swap.update({})
}

export {
  removeSwap
}
