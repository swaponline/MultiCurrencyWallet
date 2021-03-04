class Bot extends React.Component {

  state = {
    items: [],
    kraken_items: [],
    coins: ['ETH', 'BTC', 'SWAP', 'XSAT', 'HDP', 'USDT', 'JACK', 'WBTC', 'GHOST', 'NEXT']
  }

  componentDidMount() {
    this.fetchBalance();
  }

  fetchBalance = () => {
    const { coins } = this.state;

    fetch('/me/balance/', {
      method: 'POST',
      body: JSON.stringify({ coins }),
      headers:{
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result.balances
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, items, kraken_items, coins } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <h2>Bots</h2>
          {items.filter(item => coins.includes(item.symbol)).map((item, i) => (
            <div key={i} >
              {item.symbol} : {item.amount} ({item.address})
            </div>
          ))}
        </div>
      )
    }
  }
}
