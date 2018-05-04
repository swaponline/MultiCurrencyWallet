export const REQUEST_HISTORY = 'REQUEST_HISTORY'
export const GET_HISTORY = 'GET_HISTORY'

export function getHistory(history) {
    return dispatch => {
        dispatch({
            type: GET_HISTORY,
            history   
        })
    }
}
