import { CREATE_ACCOUNT } from '../actions/index'

const wallets = (state = [], action)  => {
    switch (action.type) {
        case CREATE_ACCOUNT:
            return [
                ...state,
                {
                    walletEth: action.walletEth,
                    walletBtc: action.walletBtc,
                }
            ];
        default:
            return state
    }
};

export default wallets