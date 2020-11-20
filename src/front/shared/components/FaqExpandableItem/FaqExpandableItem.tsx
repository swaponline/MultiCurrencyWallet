import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './FaqExpandableItem.scss'

import Href from 'components/Href/Href'

const FaqExpandableItem = ({ link, question }) => (
  <div styleName="container">
    <Href tab={link} styleName="header" rel="noreferrer noopener">
      {question}
    </Href>
  </div>
)

FaqExpandableItem.propTypes = {
  question: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
}

export default CSSModules(FaqExpandableItem, styles)
