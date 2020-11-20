export const initialState = {
  items:[],
}


export const addItems = (state, payload) => ({
  ...state,
  items:[
    ...payload,
  ],
})

export const deleteItems = (state, payload) => ({
  ...state,
  items: payload,
})
