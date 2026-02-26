import webpack from 'webpack'
import chalk from 'chalk'
import _debug from 'debug'
import webpackCfg from '../../../../webpack'


const debug = _debug('app:bin:compile')
const compiler = webpack(webpackCfg)


debug(`Environment is set to: ${process.env.NODE_ENV || 'default'}`)
debug('Webpack compiler starting to build')

compiler.run((err, stats) => {
  if (err) {
    debug(chalk.red(err))
    process.exit(1)
  }

  if (!stats) {
    debug(chalk.red('Webpack compilation failed with no stats'))
    process.exit(1)
  }

  const jsonStats = stats.toJson()

  debug('Compilation completed!')

  console.log(stats.toString({
    colors: true,
    children: false,
    chunks: false,
  }))

  if (jsonStats.errors.length > 0) {
    debug(chalk.red(jsonStats.errors))
    process.exit(1)
  }
  else if (jsonStats.warnings.length > 0) {
    // debug(chalk.yellow(jsonStats.warnings))
  }

  debug('All done - everything is good to go.')
  process.exit(0)
})
