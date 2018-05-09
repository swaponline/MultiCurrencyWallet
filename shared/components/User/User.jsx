import React from 'react'
import './User.scss'

import UserTooltip from '../UserTooltip/UserTooltip'

import Add from '../controls/Add/Add'
import Question from '../controls/Question/Question'
import Open from '../controls/Open/Open'

class User extends React.Component{

    constructor() {
        super()

        this.state = {
            visible: false
        }

        this.handleChage = this.handleChage.bind(this)
    }

    handleChage() {
        this.setState({ visible: !this.state.visible })
    }

    render() {
        const { isOpen } = this.props
        const { visible } = this.state
        return(
            <div className="user-cont">
                <Question />
                <Add isOpen={isOpen}/>
                <Open open={this.handleChage}/>
                { visible ? <UserTooltip /> : '' }
            </div>
        )
    }
} 


export default User