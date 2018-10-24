import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Table.scss'

import reducers from 'redux/core/reducers'


@CSSModules(styles, { allowMultiple: true })
export default class Table extends React.Component {

  constructor() {
    super()

    this.state = {
      sticky: false,
      selectId: 0
    }
  }

  componentDidMount() {
    if (this.props.id === 'table-wallet')  {
      window.addEventListener('scroll', this.handleScrollTable)
      window.addEventListener('resize', this.handleResponsiveTable)
      this.handleResponsiveTable()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScrollTable)
    window.removeEventListener('resize', this.handleResponsiveTable)
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

  handleSelectId = (id) => {
    this.setState(() => ({ selectId: id }))
  }

  handleResponsiveTable = () => {
    const { linkOnTableBody: tdLink, linkOnTableHead: thLink  } = this

    let th = thLink.children[0].cells
    let td = tdLink.children[0].cells

    for (let i = 0; i < th.length; i++) {
      th[i].style.width = `${td[i].offsetWidth}px`
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { rows, isLoading } = this.props
    return isLoading !== nextProps.isLoading || rows !== nextProps.rows || this.state.sticky !== nextState.sticky || this.state.selectId !== nextState.selectId
  }


  render() {
    const { titles, rows, rowRender, textIfEmpty, isLoading, loadingText, className } = this.props
    const { sticky } = this.state
    return (
      <table styleName={sticky ? 'table table-fixed' : 'table'} className={className} ref={(table) => this.linkOnTable = table}>
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
              typeof rowRender === 'function' && rowRender(row, rowIndex, this.state.selectId, this.handleSelectId)
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
