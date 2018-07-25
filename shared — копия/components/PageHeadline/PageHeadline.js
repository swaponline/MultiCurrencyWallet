import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './PageHeadline.scss'

import Title from './Title/Title'
import SubTitle from './SubTitle/SubTitle'


const PageHeadline = ({ children, title, subTitle }) => (
  <div styleName="headline">
    {
      children || (
        <Fragment>
          {
            title && (
              <Title>{title}</Title>
            )
          }
          {
            subTitle && (
              <SubTitle>{subTitle}</SubTitle>
            )
          }
        </Fragment>
      )
    }
  </div>
)

PageHeadline.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
}

export default CSSModules(PageHeadline, styles)
