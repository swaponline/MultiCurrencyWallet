import express from 'express'
import webpack from 'webpack'
import bodyParser from 'body-parser'
import historyApiFallback from 'connect-history-api-fallback'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackConfig from '../../webpack/index'


const port      = 9001
const app       = express()
const compiler  = webpack(webpackConfig)


app.disable('x-powered-by')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ strict: true, limit: '10mb' }))
app.use(historyApiFallback())
app.use(webpackMiddleware(compiler, webpackConfig.devServer))

app.listen(port, '127.0.0.1', (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Listening on port %s. Open up http://127.0.0.1:%s/ in your browser.', port, port)
})
