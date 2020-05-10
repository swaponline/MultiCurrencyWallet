import React, { Component } from "react"

import CSSModules from "react-css-modules"
import actions from "redux/actions";
import reducers from "redux/reducers"

import styles from "./styles.scss"

@CSSModules(styles, { allowMultiple: true })
class SwitchCurrency extends Component {

  constructor(props) {
    super(props)

    const activeFiat = localStorage.getItem('activeFiat') || 'USD'
    this.state = {
      activeFiat,
      filterValue: "",
      isListOpen: false
    }
  }

  componentDidMount() {
    this.getFiats()
  };

  getFiats = async () => {
    const { fiats } = await actions.user.getFiats()

    this.setState(() => ({ fiats, defaultFiats: fiats }))
  }

  handleToggleList = (e) => {
    e.preventDefault()
    this.setState(({ isListOpen, defaultFiats }) => ({ isListOpen: !isListOpen, filterValue: "", fiats: defaultFiats }))
  }

  handleFilterCurrencies = ({ target }) => {
    const { defaultFiats } = this.state
    const { value } = target

    const filteredFiats = defaultFiats.filter(el => {
      return el.toLowerCase().includes(value.toLowerCase())
    })
    this.setState(() => ({ filterValue: value, fiats: filteredFiats }))
  }

  handleCurrChoose = (activeFiat) => {
    localStorage.setItem('activeFiat', activeFiat)

    this.setState(({ defaultFiats }) => ({ activeFiat, isListOpen: false, fiats: defaultFiats }))
    actions.user.getFiats()
  }

  render() {
    const { activeFiat, fiats, isListOpen, filterValue } = this.state

    return fiats ?
      <div styleName="currencySwitcher">
        <div onClick={this.handleToggleList} styleName="label">{activeFiat}<div styleName="arrow" /></div>
        {isListOpen &&
          <div styleName="listStyle">
            <form ><input value={filterValue} onChange={this.handleFilterCurrencies} /></form>
            {fiats.map(el => <li key={el} onClick={() => this.handleCurrChoose(el)} styleName={`currency ${el === activeFiat ? "selected" : ""}`}>{el}</li>)}
          </div>
        }
      </div>
      : <span />
  }
}

export { SwitchCurrency }