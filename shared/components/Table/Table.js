import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Table.scss'


const Table = ({ titles, rows, rowRender, cellRender }) => (
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
        rows.map((row, rowIndex) => {
          if (typeof rowRender === 'function') {
            return rowRender(row, rowIndex)
          }

          return (
            <tr key={rowIndex}>
              {
                row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    {
                      typeof cellRender === 'function' ? (
                        cellRender(cell, colIndex, rows, titles)
                      ) : (
                        cell
                      )
                    }
                  </td>
                ))
              }
            </tr>
          )
        })
      }
    </tbody>
  </table>
)

export default cssModules(Table, styles)
