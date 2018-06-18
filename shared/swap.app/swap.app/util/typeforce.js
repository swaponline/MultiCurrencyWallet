import typeforce from 'typeforce'


const check = (...args) => {
  try {
    return typeforce(...args)
  }
  catch (err) {
    return false
  }
}

const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value)


export default {
  t: typeforce,
  check,
  isNumeric,
}
