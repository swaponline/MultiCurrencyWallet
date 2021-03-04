import React from 'react';
import {
  calculateActiveItemTranslateX,
  calculateNextIndex,
  calculatePreviousIndex,
} from './helpers'

const withCarouselValues = () => (Cpmt) => (props) => {
  const {
    children,
    activeItemIndex,
    activePosition,
    containerWidth,
    numberOfCards,
    slidesToScroll,
    gutter,
    firstAndLastGutter,
    showSlither,
  } = props;

  const items = React.Children.toArray(children);

  return (
    <Cpmt
      {...props}
      items={items}
      nextItemIndex={calculateNextIndex({
        activePosition,
        activeItemIndex,
        numberOfCards,
        slidesToScroll,
        numberOfChildren: items.length,
      })}
      previousItemIndex={calculatePreviousIndex({
        activePosition,
        activeItemIndex,
        numberOfCards,
        slidesToScroll,
        numberOfChildren: items.length,
      })}
      activeItemTranslateX={calculateActiveItemTranslateX({
        activeItemIndex,
        activePosition,
        containerWidth,
        numberOfChildren: items.length,
        numberOfCards,
        gutter,
        firstAndLastGutter,
        showSlither,
      })}
    />
  );
}

export default withCarouselValues;