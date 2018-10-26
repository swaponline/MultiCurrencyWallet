import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import jdenticon from 'jdenticon'

import CSSModules from 'react-css-modules'
import styles from './Avatar.scss'
import ReactTooltip from 'react-tooltip'


const Avatar = ({ value, className, size }) => (
  <Fragment>
    <img
      className={className}
      styleName="avatar"
      alt={value}
      src={`data:image/svg+xml,${encodeURIComponent(jdenticon.toSvg(value, size))}`}
      data-tip data-for="gravatar"
    />
        <ReactTooltip id="gravatar" type="light" effect="solid" >
          <span>This is your automatically created gravatar. Its unique for every profile</span>
        </ReactTooltip>
    </Fragment>
)

Avatar.defaultProps = {
  size: 35,
}

Avatar.propTypes = {
  value: PropTypes.string.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
}

export default CSSModules(Avatar, styles)
