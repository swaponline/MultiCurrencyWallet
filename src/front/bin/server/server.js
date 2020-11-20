import express from 'express'
import webpack from 'webpack'
import chalk from 'chalk'
import _debug from 'debug'
import bodyParser from 'body-parser'
import historyApiFallback from 'connect-history-api-fallback'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackConfig from '../../../../webpack'


const port      = process.env.PORT || 9001
const host      = process.env.HOST || '0.0.0.0'

const app       = express()
const compiler  = webpack(webpackConfig)
const debug     = _debug('app:bin:server')


app.disable('x-powered-by')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ strict: true, limit: '10mb' }))
app.use(historyApiFallback())
app.use(webpackMiddleware(compiler, webpackConfig.devServer))

app.listen(port, host, (err) => {
  if (err) {
    debug(chalk.red(err))
  }
  debug(`Listening: http://${host}:${port}/`)
})
