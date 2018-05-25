/* eslint-disable global-require, import/no-dynamic-require */

import path from 'path'
import { merge } from 'lodash'


const env = process.env.NODE_ENV

let envConfigPath
let defaultConfig
let envConfig = {}
let cfgDir = process.env.CONFIG_DIR

// figure out where the config files are at
if (!cfgDir) {
  cfgDir = `${path.resolve(process.cwd(), 'config/')}/`
}
else {
  cfgDir = `${path.resolve(cfgDir)}/`
}

const defaultConfigPath = path.join(cfgDir, 'default')
if (env) {
  envConfigPath = path.join(cfgDir, env)
}

try {
  defaultConfig = require(defaultConfigPath)
}
catch (err) {
  defaultConfig = {} // no default specified
}

try {
  if (envConfigPath) {
    envConfig = require(envConfigPath)
  }
}
catch (err) {
  throw new Error(err)
}

const config = merge(defaultConfig, envConfig)


export default config
