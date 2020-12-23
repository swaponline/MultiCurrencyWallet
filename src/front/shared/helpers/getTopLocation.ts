const getTopLocation = (): any => {
  try {
    const topLocation: any = window.top.location
    const tryGetHost: any = topLocation.host
    const tryGetHostname: any = topLocation.hostname
    return topLocation
  } catch (e) {
    return window.location
  }
}


export default getTopLocation