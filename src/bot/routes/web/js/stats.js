class CurrencyStats extends React.Component {
  render() {
    const { data } = this.props
    const { ticker, market_price, total, average, last } = data

    return (
      <tr>
        <td>
          {ticker}
        </td>

        <td>
          {market_price.toFixed(6)} BTC
        </td>

        <td>
          {average.btc_profit.toFixed(6)} BTC
          {' = '}
          {average.usd_profit.toFixed(6)} USD
        </td>

        <td>
          {last.btc_profit.toFixed(6)} BTC
          {' = '}
          {last.usd_profit.toFixed(6)} USD
        </td>

        <td>
          {total.btc_profit.toFixed(6)} BTC
          {' = '}
          {total.usd_profit.toFixed(6)} USD
        </td>
      </tr>
    )
  }
}

class Statistics extends React.Component {

  state = {
    currencies: [],
    swaps: [],
  }

  getCreatedAt = (swap) => {
    const { flow } = swap

    const scriptValues = flow.utxoScriptValues

    if (!scriptValues) return

    return scriptValues.lockTime - 3 * 3600
  }

  calculateStatsForCurrency = (_ticker, swaps, prices, time) => {
    const [ main, base ] = _ticker.split('-')

    const usd_price = prices[`USD-${base}`] || 1
    const market_price = BigNumber(prices[_ticker])

    console.log(new Date().toISOString(), 'ticker price', market_price)
    // const now = Date.now()

    const processed = swaps
      .filter(({ swap }) => swap.flow.isFinished)
      // .filter(({ swap }) => !time || this.getCreatedAt(swap) > now - time)
      .filter(({ pair: { ticker } }) => ticker === _ticker)
      .map(({ pair: { price, amount, type }}) => {
        return {
          price,
          amount,
          type,
        }
      })
      .map(({ price, amount, type }) => {
        const _amount = BigNumber(amount).div(price) // in MAIN

        const totalMarket = _amount.times(market_price)
        const totalBase = _amount.times(price)

        const btc_profit = type === 'bid'
          ? totalMarket.minus(totalBase)
          : totalBase.minus(totalMarket)

        const usd_profit = btc_profit.div(usd_price)

        return {
          btc_profit,
          usd_profit,
          ticker: _ticker,
        }
      })

    console.log(new Date().toISOString(), 'processed', processed)

    return {
      ticker: _ticker,
      market_price,
      average: {
        btc_profit: processed
          .reduce((sum, { btc_profit }) => btc_profit.plus(sum), BigNumber(0))
          .div(processed.length || 1),
        usd_profit: processed
          .reduce((sum, { usd_profit }) => usd_profit.plus(sum), BigNumber(0))
          .div(processed.length || 1),
      },
      last: {
        btc_profit: processed[0] ? processed[0].btc_profit : BigNumber(0),
        usd_profit: processed[0] ? processed[0].usd_profit : BigNumber(0),
      },
      total: {
        btc_profit: processed
          .reduce((sum, { btc_profit }) => btc_profit.plus(sum), BigNumber(0)),
        usd_profit: processed
          .reduce((sum, { usd_profit }) => usd_profit.plus(sum), BigNumber(0)),
      },
    }
  }

  calculateStats(swaps, prices) {
    const curr_with_duplicates = swaps.map(({ pair: { ticker } }) => ticker)

    const curr_list = [...new Set(curr_with_duplicates)]

    const updatedCurrencies = curr_list.map(_ticker => {
      const filtered = swaps.filter(({ pair: { ticker }}) => ticker === _ticker)

      return this.calculateStatsForCurrency(_ticker, filtered, prices)
    })

    const currencies = [
      ...this.state.currencies,
      ...updatedCurrencies,
    ]

    this.setState({
      currencies: updatedCurrencies,
    })
  }


  componentDidMount() {
    Promise.all([
      fetch(`/info/prices`)
        .then(res => res.json()),
      fetch(`/swaps/finished?parsed=true`)
        .then(res => res.json()),
    ])
    .then(
      ([ prices, swaps ]) => {
        console.log(prices, swaps)

        this.setState({
          isLoaded: true,
          swaps: swaps.reverse(),
          prices: prices,
        })

        this.calculateStats(swaps, prices)
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
  }

  onTypeChanged(event) {
    this.setState({
      type: event.target.value
    });
  }

  render() {
    const { error, isLoaded, currencies, swaps } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else if (!swaps.length) {
      return <div>Empty</div>;
    }

    return (
      <div>
        <h2>Statistics</h2>
        <table>
        <thead>
          <tr>
            <td>
              Market
            </td>

            <td>
              Market Price
            </td>

            <td>
              Average
            </td>

            <td>
              Last
            </td>

            <td>
              Total
            </td>
          </tr>
        </thead>
        <tbody>
          {currencies.map((item) => (
            <CurrencyStats key={item.ticker} data={item} />
          ))}
        </tbody>
        </table>
      </div>
    );
  }
}
