export enum FG_COLORS {
  BLACK = '\x1b[30m',
  RED = '\x1b[31m',
  GREEN = '\x1b[32m',
  YELLOW = '\x1b[33m',
  BLUE = '\x1b[34m',
  MAGENTA = '\x1b[35m',
  CYAN = '\x1b[36m',
  WHITE = '\x1b[37m',
}

export enum BG_COLORS {
  BLACK = '\x1b[40m',
  RED = '\x1b[41m',
  GREEN = '\x1b[42m',
  YELLOW = '\x1b[43m',
  BLUE = '\x1b[44m',
  MAGENTA = '\x1b[45m',
  CYAN = '\x1b[46m',
  WHITE = '\x1b[47m',
}

export enum STYLES {
  BRIGHT = '\x1b[1m',
  DIM = "\x1b[2m",
  UNDERSCORE = '\x1b[4m',
  BLINK = '\x1b[5m',
  REVERSE = '\x1b[7m',
  HIDDEN = '\x1b[8m',
}

const OP_RESET = '\x1b[0m'

interface formatStringOptions {
  color: FG_COLORS,
  bg?: BG_COLORS,
  styles?: Array<STYLES>,
}

export const colorString = (string: string, options: formatStringOptions | FG_COLORS): string => {
  if (typeof options === `string`) {
    return `${options}${string}${OP_RESET}`
  }
  let ret: string = `${options.color}`
  if (options.bg) ret = `${ret}${options.bg}`
  if (options.styles && options.styles.length) {
    options.styles.forEach((style) => {
      ret = `${ret}${style}`
    })
  }
  return `${ret}${string}${OP_RESET}`
}


