export const initialState = {
  dashboardModalsAllowed: false,
}


export const allowDashboardModals = (state) => ({
  ...state,
  dashboardModalsAllowed: true,
})
export const disallowDashboardModals = (state) => ({
  ...state,
  dashboardModalsAllowed: false,
})
