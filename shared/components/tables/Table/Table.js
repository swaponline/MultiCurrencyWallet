import React from 'react'

import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './Table.scss'

import reducers from 'redux/core/reducers'

@CSSModules(styles, { allowMultiple: true })
export default class Table extends React.Component {
  constructor() {
    super()

    this.state = {
      sticky: false,
    }
  }

  componentDidMount() {
    const { id } = this.props
    if (id) {
      window.addEventListener('scroll', this.handleScrollTable)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScrollTable)
  }

  handleScrollTable = () => {
    const { id } = this.props
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop
    let tableOffset = document.getElementById(id).offsetTop
    let tableHeight = document.getElementById(id).clientHeight
    if (scrollTop > tableOffset && scrollTop < tableOffset + tableHeight) {
      reducers.menu.setIsDisplayingTable(true)
      this.setState(() => ({ sticky: true }))
    } else {
      this.setState(() => ({ sticky: false }))
      reducers.menu.setIsDisplayingTable(false)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { rows, isLoading } = this.props
    return isLoading !== nextProps.isLoading || rows !== nextProps.rows || this.state.sticky !== nextState.sticky
  }

  render() {
    const { titles, rows, rowRender, textIfEmpty, isLoading, loadingText, classTitle, id } = this.props
    const { sticky } = this.state

    return (
      <table styleName={sticky ? 'table table-fixed' : 'table'} className={classTitle} id={id}>
        <thead>
          <tr>
            {
              titles.filter(title => !!title).map((title, index) => (
                <th key={index}>{title}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            isLoading && (
              <tr>
                <td styleName="color">{loadingText}</td>
              </tr>
            )
          }
          {
            !isLoading && !rows.length && (
              <tr>
                <td styleName="color">{textIfEmpty}</td>
              </tr>
            )
          }
          {
            !isLoading && !!rows.length && rows.map((row, rowIndex) => (
              typeof rowRender === 'function' && rowRender(row, rowIndex)
            ))
          }
        </tbody>
      </table>
    )
  }
}

Table.defaultProps = {
  textIfEmpty: 'The table is empty',
  loadingText: 'Loading...',
}

// export default connect(() => {}, (dispatch) => ({
//   setIsDisplayingTable: payload => dispatch(setIsDisplayingTable(payload)),
// }))
