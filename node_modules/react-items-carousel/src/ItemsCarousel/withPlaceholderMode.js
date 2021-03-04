import React from 'react';

export default () => (Cpmt) => {
  return class WithPlaceholderMode extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isPlaceholderMode: this.props.enablePlaceholder && React.Children.count(this.props.children) === 0,
      };
    }

    componentDidMount() {
      this.startPlaceholderMinimumTimer();
    }

    componentWillUnmount() {
      if(this.placeholderTimer) {
        clearTimeout(this.placeholderTimer);
      }
    }

    componentDidUpdate(prevProps) {
      // Data loaded and no timer to deactivate placeholder mode
      if (
        React.Children.count(this.props.children) > 0 &&
        React.Children.count(prevProps.children) === 0 &&
        !this.placeholderTimer &&
        this.state.isPlaceholderMode
      ) {
        this.setState({ isPlaceholderMode: false });
      }
    }

    startPlaceholderMinimumTimer = () => {
      if(!this.props.minimumPlaceholderTime) {
        return;
      }

      this.placeholderTimer = setTimeout(() => {
        this.placeholderTimer = null;
        if (React.Children.count(this.props.children) > 0) {
          this.setState({ isPlaceholderMode: false });
        }
      }, this.props.minimumPlaceholderTime);
    };

    getPlaceholderItems = () => {
      const {
        placeholderItem,
        numberOfPlaceholderItems,
      } = this.props;

      return Array.from(Array(numberOfPlaceholderItems)).map(index => placeholderItem);
    };

    render() {
      return (
        <Cpmt
          {...this.props}
          items={this.state.isPlaceholderMode ? this.getPlaceholderItems() : this.props.items}
        />
      )
    }
  }
}