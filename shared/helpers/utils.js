/* eslint-disable */
import path from 'path'
import config from 'app-config'


export const exitListener = () => {
  /**
   * listening for array signalls
   * and call funct wich argument
   */
  [ 'SIGINT', 'SIGTERM', 'SIGBREAK' ]
    .forEach(SIGNAL => {
      process.on(SIGNAL, () => {
        console.log('Process out...')
        process.kill(0, 'SIGKILL')
        process.exit()
      })
    })
}

export const capitalize = s => s.charAt(0).toUpperCase() + s.substr(1)

export const createRepo = (dirpath = `./data/`) => {
  // dirpath += Math.ceil(Math.random() * 10000)
  return path.resolve(dirpath)
}

