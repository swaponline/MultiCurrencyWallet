export const CREATE_ACCOUNT = 'CREATE_ACCOUNT';

export const createAccount = account => {
    return dispatch => {
        dispatch({
            type: CREATE_ACCOUNT,
            account 
        })
    }
};