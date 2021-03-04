import React from 'react';
import Measure from 'react-measure';

export default () => (Cpmt) => {
  return class WithContainerWidth extends React.Component {
    render() {
      return (
        <Measure
          bounds
          margin={false}
          whitelist={['width', 'height']}
        >
          {({ measureRef, contentRect }) => (
            <Cpmt
              {...this.props}
              measureRef={measureRef}
              containerWidth={contentRect.bounds.width || 0}
              containerHeight={contentRect.bounds.height || 0}
            />
          )}
        </Measure>
      );
    }
  }
};