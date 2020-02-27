const getHostName = (url) => {
  let hostname
  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2]
  } else {
    hostname = url.split('/')[0]
  }

  hostname = hostname.split(':')[0]
  hostname = hostname.split('?')[0]

  if (hostname === '.') return false
  if (hostname === '') return false
  return hostname
}

export default getHostName
