import React from 'react'
import { connect } from 'redaction'
import { withRouter } from 'react-router-dom'
import cssModules from 'react-css-modules'
import cx from 'classnames'

import ModalConductor from 'components/modal/ModalConductor/ModalConductor'
import styles from './styles.scss'


const ModalConductorProvider = ({ children, history, modals, ...props }) => {
  const isAnyModalCalled = Object.keys(modals).length

  return (
    <div className={cx({
      __modalConductorProvided__: true,
      [styles.modalsCalled]: isAnyModalCalled,
    })}>
      {
        isAnyModalCalled
          ? <ModalConductor dashboardView history={history} />
          : children
      }
    </div>
  )
}

export default connect(({
  modals,
  ui: { dashboardModalsAllowed },
}) => ({
  modals,
  dashboardView: dashboardModalsAllowed,
}))(withRouter(cssModules(ModalConductorProvider, styles, { allowMultiple: true })))
