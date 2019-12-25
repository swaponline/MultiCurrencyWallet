import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from './ContentLoader.scss'
import ContentSection from './components/ContentSection/ContentSection';
import DescrSection from './components/DescrSection/DescrSection';
import BalanceSection from './components/BalanceSection/BalanceSection';

function ContentLoader({ empty, inner, rideSideContent, leftSideContent }) {

  return (
    <Fragment>
      {
        rideSideContent ? (
          <div styleName={`animationLoading rideSideContent ${empty ? 'stop' : ''} ${inner ? 'inner' : ''}`}>
            {
                empty ? (
                    <div styleName="textBlock">
                    <p>No transactions</p>
                    <span>There isn't any activity in your account yet</span>
                </div>
                ) : ''
            }
            {!empty ? <DescrSection /> : ''}
            <ContentSection />
            <ContentSection />
            <ContentSection />
            <ContentSection />
          </div>
        ) : ''
      }
      {
        leftSideContent ? (
          <div styleName="animationLoading leftSideContent">
            <BalanceSection />
          </div>
        ) : ''
      }
    </Fragment>
  );
}

export default CSSModules(ContentLoader, styles, { allowMultiple: true })


