import reducers from 'redux/core/reducers'


const allowDashboardModals = () => reducers.ui.allowDashboardModals()
const disallowDashboardModals = () => reducers.ui.disallowDashboardModals()

export default {
  allowDashboardModals,
  disallowDashboardModals,
}
