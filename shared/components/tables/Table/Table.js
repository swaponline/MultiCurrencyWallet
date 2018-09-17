import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Table.scss'

@CSSModules(styles, { allowMultiple: true })
export default class Table extends React.Component {

  constructor() {
    super()

    this.state = {
      sticky: false
    }

    this.handleScrollTable = this.handleScrollTable.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScrollTable);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScrollTable);
  }

  handleScrollTable() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let table = document.querySelector('table').offsetTop;
      if ( scrollTop > table ) {
        this.setState(() => ({sticky: true}))
      }
      else {
        this.setState(() => ({sticky: false}))
      }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { rows, isLoading } = this.props
    return (
      isLoading !== nextProps.isLoading || rows !== nextProps.rows || this.state.sticky !== nextState.sticky
    )
  }


  render() {
    const { titles, rows, rowRender, textIfEmpty, isLoading, loadingText, classTitle } = this.props
    const { sticky } = this.state

    return (
      <table styleName={sticky ? 'table table-fixed' : 'table'} className={classTitle}>
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
