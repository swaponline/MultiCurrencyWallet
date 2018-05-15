import React from 'react'
import PropTypes from 'prop-types'

import Offer from '../Offer/Offer'
import BalanceCard from '../BalanceCard/Card'

const MODAL_COMPONENTS = {
    'OFFER': Offer,
    'CARD': BalanceCard
}

const ModalRoot = ({name, open, ...rest}) => {
    if (!name) {
        return <span /> 
    }
    
    const SPECIFIC_MODAL = MODAL_COMPONENTS[name]
    return <SPECIFIC_MODAL {...rest} open={open} />
}

ModalRoot.propTypes = {
    isClose: PropTypes.func.isRequired,
    isUpdate: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired
}

export default ModalRoot