const getTopLocation = (): any => {
  try {
    return window.top.location
  } catch (e) {
    return window.location
  }
}


export default getTopLocation