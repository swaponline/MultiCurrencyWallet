import React from 'react'
import { pick } from 'lodash/fp'
import { connect } from 'react-redux'
import { withRouter, Route as RRoute, Switch as RSwitch } from 'react-router-dom'


const UPDATE_LOCATION = 'UPDATE_LOCATION'
const updateLocation = location => ({ type: UPDATE_LOCATION, location })

export class ListeningRouter extends React.Component {
  componentWillMount() {
    this.props.updateLocation(this.props.location)
  }

  componentWillReceiveProps(nextProps) {
    this.props.updateLocation(nextProps.location)
  }

  render() {
    return React.Children.only(this.props.children)
  }
}
ListeningRouter = withRouter(connect(null, { updateLocation })(ListeningRouter))

const addLocation = connect(pick('location'))
export const Route = addLocation(RRoute)
export const Switch = addLocation(RSwitch)

export const routeReducer = (state, action) => {
  if (action.type === UPDATE_LOCATION) {
    return { ...state, location: action.location }
  }

  return state
}