import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'
import styles from './EmptyTransactions.scss'



function EmptyTransactions() {

  return (
    <div styleName="emptyTransactions">
        <div styleName="textBlock">
            <p>No transactions</p>
            <span>There isn't any activity in your account yet</span>
        </div>
    </div>
  );
}

export default CSSModules(EmptyTransactions, styles, { allowMultiple: true })
