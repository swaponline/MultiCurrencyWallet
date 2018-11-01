import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import jdenticon from 'jdenticon'

import CSSModules from 'react-css-modules'
import styles from './Avatar.scss'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const Avatar = ({ value, className, size }) => (
  <Fragment>
    <img
      className={className}
      styleName="avatar"
      alt={value}
      src={`data:image/svg+xml,${encodeURIComponent(jdenticon.toSvg(value, size))}`}
      data-tip
      data-for="a"
    />
    <ReactTooltip id="a" type="light" effect="solid" >
      <FormattedMessage id="transaction27" defaultMessage="Automatically created gravatar. its unique for every profile. You can see your in the upper right corner">
        {message => <span>{message}</span>}
      </FormattedMessage>
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
