import React from 'react'
import AddSvg from './add.svg'

import './User.scss'

import UserTooltip from '../UserTooltip/UserTooltip'

class User extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            visible: false
        }

        this.isOpen = this.isOpen.bind(this)
    }

    isOpen(event) {
        event.preventDefault()
        this.props.isOpen()
    }
     
    render() {
        return (
            <div className="user-cont">
                <a href="#" className="user-cont__help">?</a>
                <a href="" className="user-cont__add-user" onClick={ this.isOpen }>
                    <img src={AddSvg} alt=""/>
                </a>
                <div className="users" onClick={ () => this.setState({ visible: !this.state.visible }) }>
                    <div className="users__user">
                        <span className="users__user-letter">K</span>
                        <span className="users__user-status"> </span>
                    </div>
                </div>
                { this.state.visible ? <UserTooltip /> : '' }
            </div>
        )
    }
}

export default User