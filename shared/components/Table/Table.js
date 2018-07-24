import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Table.scss'


const Table = ({ titles, rows, rowRender, textIfEmpty }) => (
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
      { rows[0] ?
        rows.map((row, rowIndex) => {
          if (typeof rowRender === 'function') {
            return rowRender(row, rowIndex)
          }
        }) :
        <tr><td>{textIfEmpty}</td></tr>
      }
    </tbody>
  </table>
)


export default cssModules(Table, styles)
