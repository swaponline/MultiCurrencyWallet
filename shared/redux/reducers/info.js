export const initialState = {
  faq: {
    items: [],
    fetching: false,
  },
}

export const setFaq = (state, { faq }) => ({
  ...state,
  faq,
})
