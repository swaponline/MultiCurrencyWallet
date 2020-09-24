import React, { PureComponent } from 'react'


export default (options = { processClick: false }) =>
  (Component) =>
    class WrappedComponent extends PureComponent {

      state = {
        isToggleActive: false,
      }

      toggleClose = (event) => {
        if (options.processClick) {
          event.stopPropagation()

          document.removeEventListener('click', this.toggleClose)
        }

        this.setState({
          isToggleActive: false,
        })
      }

      toggleOpen = (event) => {
        const { isToggleActive } = this.state

        if (isToggleActive) {
          return
        }

        if (options.processClick) {
          event.stopPropagation()

          document.addEventListener('click', this.toggleClose)
        }

        this.setState({
          isToggleActive: true,
        })
      }

      render() {

        return (
          <Component
            {...this.props}
            {...this.state}
            toggleOpen={this.toggleOpen}
            toggleClose={this.toggleClose}
          />
        )
      }
    }
