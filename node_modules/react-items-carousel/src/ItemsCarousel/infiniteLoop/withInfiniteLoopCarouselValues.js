import React from 'react';
import infiniteLoopHelpers from './helpers';

const withInfiniteLoopCarouselValues = () => (Cpmt) => (props) => {
  const {
    calculateActualTranslateX: userCalculateActualTranslateX,
    numberOfCards,
    activeItemIndex: oldActiveItemIndex,
    numberOfChildren,
    slidesToScroll,
    containerWidth,
    gutter,
    firstAndLastGutter,
    showSlither,
    children
  } = props;

  const activePosition = 'left';

  const items = infiniteLoopHelpers.getItems(React.Children.toArray(children), { numberOfCards });

  const activeItemIndex = infiniteLoopHelpers.getActiveItemIndex({
    activeItemIndex: oldActiveItemIndex,
    numberOfCards,
  });

  const previousItemIndex = infiniteLoopHelpers.getPreviousItemIndex({
    activeItemIndex,
    slidesToScroll,
  });
  const nextItemIndex = infiniteLoopHelpers.getNextItemIndex({
    activeItemIndex,
    slidesToScroll,
  });
  const activeItemTranslateX = infiniteLoopHelpers.getActiveItemTranslateX({
    activeItemIndex,
    activePosition,
    containerWidth,
    numberOfChildren: items.length,
    numberOfCards,
    gutter,
    firstAndLastGutter,
    showSlither,
  });

  const calculateActualTranslateX = currentTranslateX => {
    const actualTranslateX = infiniteLoopHelpers.getActualTranslateX(items, currentTranslateX, {
      activePosition,
      containerWidth,
      numberOfCards,
      gutter,
      firstAndLastGutter,
      showSlither,
    });

    return userCalculateActualTranslateX(actualTranslateX);
  }

  return (
    <Cpmt
      {...props}
      alwaysShowChevrons
      activePosition={activePosition}
      items={items}
      previousItemIndex={previousItemIndex}
      nextItemIndex={nextItemIndex}
      activeItemIndex={activeItemIndex}
      activeItemTranslateX={activeItemTranslateX}
      calculateActualTranslateX={calculateActualTranslateX}
    />
  );
};

export default withInfiniteLoopCarouselValues;
