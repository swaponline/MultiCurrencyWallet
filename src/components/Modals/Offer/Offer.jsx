import React from 'react'

import './Offer.scss'

import HeaderOffer from '../HeaderOffer/HeaderOffer'
import ConfirmOffer from '../ConfirmOffer/ConfirmOffer'
import AddOffer from '../AddOffer/AddOffer'

class Offer extends React.Component {
    render() {
        return(
            <div className="offer-popup">
                <HeaderOffer />
                <div className="offer-popup__center">
                
                   <AddOffer />
                   <ConfirmOffer/>

                </div>
            </div>
        )
    }
}

export default Offer