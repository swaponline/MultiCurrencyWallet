export const color = (step, el) => {
  if (step === el) {
    return 'purple'
  } else if (step > el) {
    return 'green'
  }
  return ''
}
