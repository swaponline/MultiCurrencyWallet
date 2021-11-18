/* eslint-disable */
import path from 'path'
import fs from 'fs'
import { BigNumber } from 'bignumber.js'

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

export const createRepo = (dirpath = `./data/`) => {
  // dirpath += Math.ceil(Math.random() * 10000)
  return path.resolve(dirpath)
}

export function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function setCookie(name, value, options) {
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}

/**
 * Returned string prevents from scientific notation: ex. 10e17
 */
export const toMeaningfulFloatValue = (params: {
  value: BigNumber | number | string
  rate?: BigNumber | number | string
  meaningfulDecimals?: number | false
}): string => {
  const { value, rate = 1, meaningfulDecimals = false } = params

  let result = new BigNumber(value).multipliedBy(rate)
  const strResult = result.toString()
  const floatCoincidence = strResult.match(/\..+/)

  if (floatCoincidence) {
    // exclude the decimal point
    const floatNums = floatCoincidence[0].slice(1)

    // find the first meaningful number in the float num
    const meaningfulNum = floatNums.match(/[1-9]/)

    if (meaningfulNum) {
      const numOfZeros = floatNums.indexOf(meaningfulNum[0])

      if (!meaningfulDecimals || numOfZeros >= meaningfulDecimals) {
        // save two meaningful nums by default
        result = result.dp(numOfZeros + 2, BigNumber.ROUND_CEIL)
      } else if (meaningfulDecimals) {
        result = result.dp(meaningfulDecimals, BigNumber.ROUND_CEIL)
      }
    }
  }

  return result.toString()
}