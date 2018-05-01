import React from 'react'

import './Offer.scss'

import HeaderOffer from '../HeaderOffer/HeaderOffer'
import ConfirmOffer from '../ConfirmOffer/ConfirmOffer'
import AddOffer from '../AddOffer/AddOffer'

class Offer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            visible: true
        }

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange() {
        this.setState({ visible: !this.state.visible })
    }

    render() {
        return(
            <div className="offer-popup">
                <HeaderOffer isClose={this.props.isClose} />
                <div className="offer-popup__center">
                
                    { this.state.visible ? <AddOffer isNext={this.handleChange} /> : <ConfirmOffer  isBack={this.handleChange}/> }

                </div>
            </div>
        )
    }
}

export default Offer