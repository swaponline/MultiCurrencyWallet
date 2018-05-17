const stopPropagation = (event) => event.stopPropagation()

const preventDefault = (event) => event.preventDefault()

const cancel = (event) => {
  stopPropagation(event)
  preventDefault(event)
}

export default {
  stopPropagation,
  preventDefault,
  cancel,
}
