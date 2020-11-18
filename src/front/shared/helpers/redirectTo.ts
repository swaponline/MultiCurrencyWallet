

const redirectTo = (url) => {
  if (url) {
    if (url.substr(0, 1) !== `#`) url = `#${url}`
    window.location.hash = url
  }
}

export default redirectTo
