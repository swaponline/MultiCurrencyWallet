import React from 'react'
import { connect } from 'redaction'
import { withRouter } from 'react-router-dom'
import cssModules from 'react-css-modules'
import cx from 'classnames'

import actions from 'redux/actions'
import ModalConductor from 'components/modal/ModalConductor/ModalConductor'
import styles from './styles.scss'


const ModalConductorProvider = ({ children, history, modals, ...props }) => {
  const isAnyModalCalled = Object.keys(modals).length

  const hiestZ = Object.values(modals).reduce(
    //@ts-ignore
    (acc, i) => (acc > i.zIndex ? acc : i.zIndex),
    -1
  )
  const upperModal = Object.keys(modals)[
    //@ts-ignore 
    Object.values(modals).findIndex((i) => i.zIndex === hiestZ)
  ]

  let isModalOpenedHelper = false
  const handleClick = (e) => {
    if (!isModalOpenedHelper && isAnyModalCalled) {
      return (isModalOpenedHelper = true)
    }

    if (
      !(
        e.target.closest('.__modalConductorProvided__') !== null ||
        e.target.closest('.data-tut-all-balance') !== null
      ) &&
      document.body.contains(e.target) &&
      isModalOpenedHelper
    ) {
      isModalOpenedHelper = false
      window.removeEventListener('click', handleClick)
      setTimeout(() => {
        // actions.modals.close(`${upperModal}`)
      }, 1)
    }
  }

  React.useEffect(() => {
    if (isAnyModalCalled) {
      window.removeEventListener('click', handleClick)
      window.addEventListener('click', handleClick)
    }
    return () => {
      window.removeEventListener('click', handleClick)
    }
  })

  return (
    <div
      className={cx({
        __modalConductorProvided__: true,
        [styles.modalsCalled]: isAnyModalCalled,
      })}
    >
      {isAnyModalCalled ? (
        <ModalConductor dashboardView history={history} />
      ) : (
        children
      )}
    </div>
  )
}

export default connect(({ modals, ui: { dashboardModalsAllowed } }) => ({
  modals,
  dashboardView: dashboardModalsAllowed,
}))(
  withRouter(
    //@ts-ignore 
    cssModules(ModalConductorProvider, styles, { allowMultiple: true })
  )
)
