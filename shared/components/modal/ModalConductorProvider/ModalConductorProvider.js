import React from 'react'
import { withRouter } from 'react-router-dom'
import ModalConductor from 'components/modal/ModalConductor/ModalConductor'


const ModalConductorProvider = ({ children, history, ...props }) => {
  return (
    <div className="__modalConductorProvided__">
      {children}
      <ModalConductor dashboardView history={history} />
    </div>
  )
}

export default withRouter(ModalConductorProvider)
