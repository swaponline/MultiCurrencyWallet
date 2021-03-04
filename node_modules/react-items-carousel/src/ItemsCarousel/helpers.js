import min from 'lodash.min';
import max from 'lodash.max';

export const getFirstAndLastItemGutter = ({ gutter }) =>  gutter * 2;
export const getSlither = ({ gutter }) => gutter;

export const calculateItemWidth = ({
  containerWidth,
  gutter,
  numberOfCards,
  firstAndLastGutter,
  showSlither,
}) => {
  let allGutter = gutter * (numberOfCards - 1);

  if(showSlither) {
    // Add 2 slithers
    allGutter += getSlither({ gutter }) * 2;
  }

  if(firstAndLastGutter) {
    // Add first item gutter
    allGutter += getFirstAndLastItemGutter({ gutter });
  }

  return (containerWidth - allGutter) / numberOfCards;
}

export const calculateItemLeftGutter = ({
  index,
  firstAndLastGutter,
  gutter,
}) => {
  // First item
  if(index === 0) {
    return firstAndLastGutter ? getFirstAndLastItemGutter({ gutter }) : 0;
  }
  return gutter / 2;
}

export const calculateItemRightGutter = ({
  index,
  firstAndLastGutter,
  gutter,
  numberOfChildren,
}) => {
  // Last item
  if(index === numberOfChildren - 1) {
    return firstAndLastGutter ? getFirstAndLastItemGutter({ gutter }) : 0;
  }
  return gutter / 2;
}

export const areItemsLargerThanContainer = ({
  numberOfChildren,
  numberOfCards,
}) => {
  return numberOfChildren < numberOfCards;
}

export const calculateLastPossibleTranslateX = ({
  activeItemIndex,
  activePosition,
  containerWidth,
  numberOfChildren,
  numberOfCards,
  gutter,
  firstAndLastGutter,
  showSlither,
}) => {
  const itemWidth = calculateItemWidth({
    containerWidth,
    gutter,
    numberOfCards,
    firstAndLastGutter,
    showSlither,
  });

  const hiddenChildrenLength = (numberOfChildren - numberOfCards);
  let translateX = itemWidth * hiddenChildrenLength + gutter * hiddenChildrenLength;

  if(firstAndLastGutter && !showSlither) {
    translateX += getFirstAndLastItemGutter({ gutter });
  }

  return translateX;
}

export const calculateActiveItemTranslateX = ({
  activeItemIndex,
  activePosition,
  containerWidth,
  numberOfChildren,
  numberOfCards,
  gutter,
  firstAndLastGutter,
  showSlither,
  infiniteLoop,
}) => {
  let gotoIndex = activeItemIndex;

  if(activePosition === 'center') {
    gotoIndex -= Math.floor(numberOfCards / 2);
  }

  if(activePosition === 'right') {
    gotoIndex -= numberOfCards - 1;
  }

  // Items are larger than container then
  if(areItemsLargerThanContainer({ numberOfChildren, numberOfCards })) {
    return 0;
  }

  // The first item
  if(!infiniteLoop && gotoIndex <= 0) {
    return 0;
  }

  // Last items to show
  if(!infiniteLoop && gotoIndex > (numberOfChildren - numberOfCards - 1)) {
    return calculateLastPossibleTranslateX({
      activeItemIndex: gotoIndex,
      activePosition,
      containerWidth,
      numberOfChildren,
      numberOfCards,
      gutter,
      firstAndLastGutter,
      showSlither,
    });
  }

  const itemWidth = calculateItemWidth({
    containerWidth,
    gutter,
    numberOfCards,
    firstAndLastGutter,
    showSlither,
  });

  let translateX = itemWidth * gotoIndex + gutter * gotoIndex;

  if(showSlither) {
    translateX -= getSlither({ gutter });
  }

  if(firstAndLastGutter) {
    translateX += gutter;
  }

  return translateX;
}

export const showRightChevron = ({
  activeItemIndex,
  activePosition,
  numberOfCards,
  numberOfChildren,
  slidesToScroll,
}) => {
  if(numberOfChildren <= numberOfCards) {
    return false;
  }

  return calculateNextIndex({
    activeItemIndex,
    activePosition,
    numberOfCards,
    numberOfChildren,
    slidesToScroll,
  }) > activeItemIndex;
}

export const showLeftChevron = ({
  activeItemIndex,
  activePosition,
  numberOfCards,
  numberOfChildren,
  slidesToScroll,
}) => {
  if(numberOfChildren <= numberOfCards) {
    return false;
  }

  return calculatePreviousIndex({
    activeItemIndex,
    activePosition,
    numberOfCards,
    numberOfChildren,
    slidesToScroll,
  }) < activeItemIndex;
}

export const calculateNextIndex = ({
  activePosition,
  activeItemIndex,
  numberOfChildren,
  numberOfCards,
  slidesToScroll,
}) => {
  switch(activePosition) {
    case'right':
      return max([
        min([ activeItemIndex + slidesToScroll, numberOfChildren - 1 ]),
        numberOfCards,
      ]);

    case'center':
      return max([
        min([ activeItemIndex + slidesToScroll, Math.floor(numberOfChildren - numberOfCards / 2)]),
        Math.floor(numberOfCards / 2) + 1,
      ]);

    case'left':
      return min([
        activeItemIndex + slidesToScroll,
        numberOfChildren - numberOfCards,
      ]);
  }
}

export const calculatePreviousIndex = ({
  activePosition,
  activeItemIndex,
  numberOfCards,
  numberOfChildren,
  slidesToScroll,
}) => {
  switch(activePosition) {
    case'right':
      return max([
        min([ activeItemIndex - slidesToScroll, numberOfChildren - 1 ]),
        numberOfCards - 1,
      ]);

    case'center':
      return max([
        min([ activeItemIndex - slidesToScroll, Math.floor(numberOfChildren - numberOfCards / 2) - 1]),
        Math.floor(numberOfCards / 2),
      ]);

    case'left':
      return min([
        max([ activeItemIndex - slidesToScroll, 0 ]),
        numberOfChildren - numberOfCards - 1,
      ]);
  }
}
