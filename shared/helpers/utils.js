import path  from 'path'
import fs    from 'fs'


export const removeRepo = (pathToRepo) => {
  /**
   * Check NODE_ENV if env = test or window === undefined
   * return this function
   * else delete REPO directory
   */
  if (
    typeof window !== 'undefined' ||
    !fs.existsSync(pathToRepo)
  ) {
    console.log('ENV === test or start with browser or file not exists with path')
    return
  }

  try {
    /**
     * check files in directory
     * and call functions for each of them
     */
    for (let file of fs.readdirSync(pathToRepo)) {
      /**
       * Create path to file inner directory
       */
      const curPath = path.join(pathToRepo, file)

      /**
       * if file or directory not exist
       * then missing this path
       */
      if (!fs.existsSync(curPath)) {
        continue
      }

      /**
       * if check path on directory then
       * recursive call else delete file
       */
      (fs.lstatSync(curPath).isDirectory())
        ? removeRepo(curPath)
        : fs.unlinkSync(curPath)
    }

    /** If not files then remove directory */
    fs.rmdirSync(pathToRepo)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

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

// dirpath += Math.ceil(Math.random() * 10000)
export const createRepo = (dirpath = './data/') => path.resolve(dirpath)

