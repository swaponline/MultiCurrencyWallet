class Swap extends React.Component {

  componentWillMount() {
    this.calculateProfit()
  }

  getLockTime(swap) {
    const { flow } = swap

    const scriptValues = flow.utxoScriptValues
    if (!scriptValues) return

    return scriptValues.lockTime
  }

  calculateProfit() {
    const { id, pair, swap, timestamp, prices } = this.props
    const { price, amount, ticker, main, base, type } = pair

    const market_price = BigNumber(prices[ticker])
    console.log(new Date().toISOString(), prices)
    console.log(new Date().toISOString(), ticker, prices[ticker])
    console.log(new Date().toISOString(), market_price.toString())

    const _amount = BigNumber(amount).div(price) // in MAIN

    const totalMarket = _amount.times(market_price)
    const totalBase = _amount.times(price)

    const btc_profit = type === 'bid'
      ? totalMarket.minus(totalBase)
      : totalBase.minus(totalMarket)

    console.log(new Date().toISOString(), `market: ${totalMarket}, real: ${totalBase}`)

    const usd_price = prices[`USD-${base}`] || 1
    const usd_profit = btc_profit.div(usd_price)

    this.setState({
      btc_profit,
      usd_profit,
      isProfit: Number(btc_profit) > 0
    })
  }

  render() {
    const { id, pair, swap, timestamp, prices } = this.props
    const { btc_profit, usd_profit, isProfit } = this.state

    const { price, amount, ticker, main, base, type } = pair

    const time = this.getLockTime(swap)
    const createdAt = moment.unix(time - 3 * 3600).format('HH:mm:ss DD/MM/YYYY')

    return (
      <tr>
        <td>
          {ticker}
        </td>

        <td>
          {createdAt}
        </td>

        <td>
          {swap.flow.step}
        </td>

        <td>
          {type === 'bid'
            ? 'BUY'
            : 'SELL'}
        </td>

        <td>
          {BigNumber(amount).div(price).toFixed(6)} {main}
        </td>

        <td>
          at price
        </td>
        <td>
          {BigNumber(price).toFixed(6)} {base}
        </td>

        <td>
          total
        </td>
        <td>
          {BigNumber(amount).toFixed(6)} {base}
        </td>

        <td>
          {BigNumber(btc_profit).toFixed(6)} {base}
          {' = '}
          {BigNumber(usd_profit).toFixed(6)} $
        </td>

        <td>
          {isProfit ? '+++' : '---'}
        </td>

        <td>
          <a href={`/swaps/${id}/formated`}>Go to swap</a>
          &nbsp;
          &middot;
          &nbsp;
          <a href={`/swaps/${id}/refund`}>Refund</a>
        </td>
      </tr>
    )
  }
}


class History extends React.Component {

  state = {
    filter: '',
    mode: 'finished',
    swaps: [],
    prices: {},
  }

  componentWillMount() {
    const path = this.props.location.pathname

    if (path === '/history') {
      this.setState({
        mode: 'finished'
      })
    } else if (path === '/in-progress') {
      this.setState({
        mode: 'in-progress'
      })
    } else {
      this.setState({
        filter: this.props.location.match.ticker
      })
    }
  }

  componentDidMount() {
    Promise.all([
      fetch(`/info/prices`)
        .then(res => res.json()),
      fetch(`/swaps/${this.state.mode}?parsed=true`)
        .then(res => res.json()),
    ])
    .then(
      ([ prices, swaps ]) => {
        console.log(prices, swaps)

        this.setState({
          isLoaded: true,
          swaps: swaps.reverse(),
          prices,
        })

        window.swaps = swaps.reverse()
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
    const { error, isLoaded, swaps, prices } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else if (!swaps.length) {
      return <div>Empty</div>;
    }

    return (
      <div>
        <h2>History</h2>
        <table>
        <thead>
          <tr>
            <td>
              Market
            </td>

            <td>
              Created
            </td>

            <td>
              Step
            </td>

            <td>
              Type
            </td>

            <td>
              Amount
            </td>

            <td>
            </td>

            <td>
              Price
            </td>

            <td>
            </td>

            <td>
              Total
            </td>

            <td>
              ~Profit
            </td>

            <td>
              + / -
            </td>

          </tr>
        </thead>
        <tbody>
          {swaps.map(({ id, pair, swap }) => (
            <Swap key={id} id={id} pair={pair} swap={swap} prices={prices} />
          ))}
        </tbody>
        </table>
      </div>
    );
  }
}
