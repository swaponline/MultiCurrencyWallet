import React, { useState } from 'react'
import { withRouter } from 'react-router'
import cssModules from 'react-css-modules'
import { connect } from 'redaction'
import helpers, { user as helpersUser, links } from 'helpers'
import config from 'app-config'
import actions from 'redux/actions'
import { injectIntl } from 'react-intl'

import NewDesignLayout from 'components/layout/NewDesignLayout/NewDesignLayout'

import styles from 'pages/Wallet/Wallet.scss'


const ModalRoute = (props) => {
  console.log(props)
  const {
    match: {
      action,
      address,
      token,
    },
  } = props
  return ''
}

export default connect(
  ({
    modals,
    ui: { dashboardModalsAllowed },
  }) => ({
    dashboardView: dashboardModalsAllowed,
    modals,
  })
)(injectIntl(cssModules(withRouter(ModalRoute), styles, { allowMultiple: true })))
