const getPaddingValue = ({ step }) => {
  if (step <= 2) {
    const getPaddingValue = 120
    return getPaddingValue
  }
  if (step > 2 && step <= 5) {
    const getPaddingValue = 120
    return getPaddingValue
  }
  if (step >= 6 && step < 7) {
    const getPaddingValue = 120
    return getPaddingValue
  }
  if (step >= 7) {
    const getPaddingValue = 120
    return getPaddingValue
  }
}
export default getPaddingValue