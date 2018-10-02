export const initialState = {
  faqList: [],
}

export const setFaq = (state, { faqList }) => ({
  ...state,
  faqList,
})
