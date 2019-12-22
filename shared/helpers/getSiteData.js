import config from 'app-config'


const getData = () => {
  const srcFiles = config.siteNameData
  const { host, href } = window.location

  const file = Object.keys(srcFiles).find(el => href.includes(el)) || 'localhost'
  return srcFiles[file]
}

export default getData
