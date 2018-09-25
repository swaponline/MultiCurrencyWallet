export const mathConstants = {
  high_precision: 10e-8,
  low_precision: 10e-5,
}

export const areFloatsEqual = (float1, float2) => {
  const parsed1 = parseNumberWithValidityCheck(float1)
  const parsed2 = parseNumberWithValidityCheck(float2)

  if (parsed1 === undefined || parsed2 === undefined) {
    return false
  }

  if (Number.isInteger(parsed1) && Number.isInteger(parsed2)) {
    return parsed1 === parsed2
  }

  return Math.abs(parsed1 - parsed2) <= mathConstants.high_precision
}

// TODO: Give it better name
// Checks number to contain multiple dots and parceability into float
export const parseNumberWithValidityCheck = number => {
  const parsed = Number.parseFloat(number)

  if (number instanceof String && number.indexOf('.') !== -1) {
    return undefined
  }

  if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
    return parsed
  }

  return undefined
}

export const isNumberStringFormatCorrect = number => {
  const stringified = String(number)

  const firstDotIndex = stringified.indexOf('.')
  const lastDotIndex = stringified.lastIndexOf('.')

  // first and last dot positions match, so it has only one dot
  return firstDotIndex === lastDotIndex
}

export const isNumberValid = number => parseNumberWithValidityCheck(number) !== undefined
