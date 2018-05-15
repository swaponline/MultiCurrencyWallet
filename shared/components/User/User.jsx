import React from 'react'
import PropTypes from 'prop-types'
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
        const { isOpen, isUpdate, open, name } = this.props
        const { visible } = this.state
        return(
            <div className="user-cont">
                {/*<Question />*/}
                <Add isOpen={isOpen}/>
                <Open 
                    open={this.handleChage} 
                    isUpdate={isUpdate} 
                    notification={open}
                />
                { visible ? <UserTooltip open={visible} /> : '' }
            </div>
        )
    }
} 

User.propTypes = {
    isOpen: PropTypes.func.isRequired,
    isUpdate: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired
}

export default User