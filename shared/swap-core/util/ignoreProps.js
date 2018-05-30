const ignoreProps = (props = {}, ...ignored) => {
  const list = {}

  Object.keys(props).forEach(key => {
    if (!ignored.includes(key)) {
      list[key] = props[key]
    }
  })

  return list
}


export default ignoreProps
