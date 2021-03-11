class Kraken extends React.Component {

  state = {
    kraken_items: []
  }

  componentDidMount() {
    fetch(`/kraken`)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            kraken_items: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
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
      type:event.target.value
    });
  }

  render() {
    const { error, isLoaded, kraken_items } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    }

    return (
      <div >
        <h2>Krakens</h2>
        {kraken_items.filter(item => ['XXBT', 'XETH'].includes(item[0])).map(item => (
          <div>
            {item[0]} : {item[1]}
          </div>
        ))}
        <div className="row d-none">
          <div className="col-2">
            <div className="btn-group btn-group-toggle" data-toggle="buttons">
              <label className={`btn btn-secondary ${(this.state.type === 'sell' ? 'active' : '')}`}>
                <input type="radio" name="type" id="option1" onChange={this.onTypeChanged.bind(this)} autoComplete="off" value="sell" /> Sell
              </label>
              <label className={`btn btn-secondary ${(this.state.type === 'buy' ? 'active' : '')}`}>
                <input type="radio" value="buy" name="type" id="option2" onChange={this.onTypeChanged.bind(this)} autoComplete="off" /> Buy
              </label>
            </div>
          </div>
          <div className="col-3">
            <div className="form-group">
              <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
              <small id="emailHelp" className="form-text text-muted">Amount of ETH to {this.state.type}.</small>
            </div>
          </div>
          <div className="col-3">
            <div className="form-group">
              <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
              <small id="emailHelp" className="form-text text-muted">{this.state.type} at a fixed price per ETH.</small>
            </div>

          </div>
          <div className="col-2">
            <div className="form-group">
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
