import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Table.scss'

@CSSModules(styles)
export default class Table extends React.Component {

  shouldComponentUpdate(nextProps) {
    const { rows, isLoading } = this.props
    return (
      isLoading !== nextProps.isLoading || rows !== nextProps.rows
    )
  }

  render() {
    const { titles, rows, rowRender, textIfEmpty, isLoading, loadingText, classTitle } = this.props

    return (
      <table styleName="table" className={classTitle}>
        <thead>
          <tr>
            {
              titles.map((title, index) => (
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
