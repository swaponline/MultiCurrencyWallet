import React from 'react';
import {calculateItemWidth} from './helpers';

const getFirstTouchClientX = (touches, defaultValue = 0) => {
  if (touches && touches.length > 0) {
    return touches[0].clientX;
  }
  return defaultValue;
};

export default () => (Cpmt) => {
  return class WithSwipe extends React.Component {
    state = {
      startTouchX: 0,
      currentTouchX: 0,
    };

    onWrapperTouchStart = e => {
      const touchClientX = getFirstTouchClientX(e.touches);
      this.setState({
        startTouchX: touchClientX,
        currentTouchX: touchClientX
      });
    };

    onWrapperTouchEnd = e => {
      const {
        containerWidth,
        gutter,
        numberOfCards,
        firstAndLastGutter,
        showSlither,
        requestToChangeActive,
        activeItemIndex,
      } = this.props;

      const itemWidth = calculateItemWidth({
        containerWidth,
        gutter,
        numberOfCards,
        firstAndLastGutter,
        showSlither,
      });

      const touchClientX = getFirstTouchClientX(e.changedTouches);

      const touchRelativeX = this.state.startTouchX - touchClientX;

      // When the user swipes to 0.25 of the next item
      const threshold = 0.25;

      const noOfItemsToSwipe = Math.floor(Math.abs(touchRelativeX)/(itemWidth + gutter/2) + (1 - threshold));

      if (noOfItemsToSwipe > 0) {
        requestToChangeActive(
          touchRelativeX < 0 ? activeItemIndex - noOfItemsToSwipe : activeItemIndex + noOfItemsToSwipe
        );
      }

      this.setState({ startTouchX: 0, currentTouchX: 0 });
    };

    onWrapperTouchMove = e => {
      this.setState({ currentTouchX: getFirstTouchClientX(e.touches) });
    };

    render() {
      const {
        disableSwipe,
        isPlaceholderMode,
      } = this.props;

      const {
        startTouchX,
        currentTouchX,
      } = this.state;

      if (disableSwipe || isPlaceholderMode) {
        return (
          <Cpmt {...this.props} touchRelativeX={0} />
        );
      }

      return (
        <Cpmt
          {...this.props}
          onWrapperTouchStart={this.onWrapperTouchStart}
          onWrapperTouchEnd={this.onWrapperTouchEnd}
          onWrapperTouchMove={this.onWrapperTouchMove}
          touchRelativeX={startTouchX - currentTouchX}
        />
      )
    }
  }
}