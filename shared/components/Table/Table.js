import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Table.scss'


const Table = ({ titles, rows, rowRender, textIfEmpty, isLoading, loadingText }) => (
  <table styleName="table">
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


Table.defaultProps = {
  textIfEmpty: 'The table is empty',
  loadingText: 'Loading...',
}

export default cssModules(Table, styles)
