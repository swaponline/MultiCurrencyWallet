const getPaddingValue = ({ step }) => {
  if (step <= 2) {
    const getPaddingValue = 60 * step
    return getPaddingValue
  }
  if (step > 2 && step < 5) {
    const getPaddingValue = 120
    return getPaddingValue
  }
  if (step > 5 && step < 7) {
    const getPaddingValue = 180
    return getPaddingValue
  }
  if (step > 7) {
    const getPaddingValue = 210
    return getPaddingValue
  }
}
export default getPaddingValue
