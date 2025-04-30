// @ts-nocheck
import React, { Component, Fragment } from 'react'

class Chart extends Component<any, any> {
  constructor(props) {
    super(props)
    
    
  }
  
  componentDidMount() {
    const {
      currency
    } = this.props
    let isDark = (document.querySelector('BODY').dataset.scheme == 'dark')
    let pair = 'BINANCE:BTCUSDT'
    if (currency == 'eth') pair = 'BINANCE:ETHUSDC'
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    s.innerHTML = `{"symbol": "${pair}","width": "100%","height": "220","locale": "en","dateRange": "12M","colorTheme": "${(isDark) ? 'dark' : 'light'}","isTransparent": false,"autosize": false,"largeChartUrl": "","chartOnly": false}`
    document.getElementById('scriptHolder').appendChild(s)

  }
  
  render() {
    return (
      <div suppressHydrationWarning>
        <div class="tradingview-widget-container">
          <div class="tradingview-widget-container__widget"></div>
          <div style={{display: 'none' }} class="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a></div>
          <div id="scriptHolder"></div>
        </div>
      </div>
    )
  }
}


export default Chart