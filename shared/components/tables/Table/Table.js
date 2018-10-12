import React from 'react'
import ReactDOM from 'react-dom'

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
    if (this.props.id == 'table-wallet')  {
      window.addEventListener('scroll', this.handleScrollTable)
      window.addEventListener('resize', this.responsiveTable)
      this.responsiveTable();
    } 
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScrollTable)
  }

  handleScrollTable = () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop
    let tableOffset = this.linkOnTable.offsetTop
    let tableHeight = this.linkOnTable.clientHeight
    if (scrollTop > tableOffset && scrollTop < tableOffset + tableHeight && tableHeight > 400) {

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

  responsiveTable = () => {
    let table = this.linkOnTable;
    let thead = this.linkOnTableHead;
    let tbody = this.linkOnTableBody;
    let th = thead.children[0].cells;
    let td = tbody.children[0].cells;

    for(let i = 0; i < th.length; i++) {
      console.log(th[i].style.width = td[i].offsetWidth + 'px');
    }
  }

  render() {
    const { titles, rows, rowRender, textIfEmpty, isLoading, loadingText, classTitle, id } = this.props
    const { sticky } = this.state

    return (
      <table styleName={sticky ? 'table table-fixed' : 'table'} className={classTitle} ref={(table) => this.linkOnTable = table}>
        <thead ref={(thead) => this.linkOnTableHead = thead}>
          <tr>
            {
              titles.filter(title => !!title).map((title, index) => (
                <th key={index}>{title}</th>
              ))
            }
          </tr>
        </thead>
        <tbody ref={(tbody) => this.linkOnTableBody = tbody}>
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
