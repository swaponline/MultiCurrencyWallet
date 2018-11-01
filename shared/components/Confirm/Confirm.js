import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Confirm.scss'

import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Button from 'components/controls/Button/Button'
import Center from 'components/layout/Center/Center'
import { FormattedMessage } from 'react-intl'


const Confirm = ({ rootClassName, isConfirm, isReject, title, animation }) => (
  <Center>
    <div styleName={animation ? 'confirm animation' : 'confirm'} className={rootClassName}>
      <SubTitle>
        {title}
      </SubTitle>
      <div styleName="row" >
        <Button brand onClick={isConfirm}>
          <FormattedMessage id="Confirm20" defaultMessage="Yes">
            {message => <h3>{message}</h3>}
          </FormattedMessage>
        </Button>
        <Button brand onClick={isReject}>
          <FormattedMessage id="Confirm25" defaultMessage="No">
            {message => <h3>{message}</h3>}
          </FormattedMessage>
        </Button>
      </div>
    </div>
  </Center>
)

Confirm.propTypes = {
  rootClassName: PropTypes.string,
  isConfirm: PropTypes.func.isRequired,
  isReject: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  animation: PropTypes.bool,
}

export default cssModules(Confirm, styles, { allowMultiple: true })
