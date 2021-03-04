import min from 'lodash.min';
import max from 'lodash.max';
import { calculateActiveItemTranslateX } from '../helpers';

const getItems =  (items, { numberOfCards }) => {
  return [
    ...items.slice(items.length - numberOfCards),
    ...items,
    ...items.slice(0, numberOfCards),
  ];
};

const getPreviousItemIndex = ({
  activeItemIndex,
  slidesToScroll,
}) =>  activeItemIndex - slidesToScroll;

const getNextItemIndex = ({
  activeItemIndex,
  slidesToScroll,
}) => activeItemIndex + slidesToScroll;

const getActiveItemIndex = ({
  activeItemIndex,
  numberOfCards,
}) => activeItemIndex;

const getActiveItemTranslateX = ({
  activeItemIndex,
  activePosition,
  containerWidth,
  numberOfChildren,
  numberOfCards,
  gutter,
  firstAndLastGutter,
  showSlither,
}) => calculateActiveItemTranslateX({
  activeItemIndex,
  activePosition,
  containerWidth,
  numberOfChildren,
  numberOfCards,
  gutter,
  firstAndLastGutter,
  showSlither,
  infiniteLoop: true,
});

const getActualTranslateX = (items, currentTranslateX, {
  activePosition,
  containerWidth,
  numberOfCards,
  gutter,
  firstAndLastGutter,
  showSlither,
}) => {
  const lastTranslateX = getActiveItemTranslateX({
    numberOfChildren: items.length,
    activeItemIndex: items.length - numberOfCards*2,
    activePosition,
    containerWidth,
    numberOfCards,
    gutter,
    firstAndLastGutter,
    showSlither,
  });

  const leftShift = getActiveItemTranslateX({
    numberOfChildren: items.length,
    activeItemIndex: numberOfCards,
    activePosition,
    containerWidth,
    numberOfCards,
    gutter,
    firstAndLastGutter,
    showSlither,
  });


  const actualTranslateX = currentTranslateX%lastTranslateX + leftShift;

  if (actualTranslateX <= 0) {
    return lastTranslateX - Math.abs(actualTranslateX);
  }

  return actualTranslateX;
}

export default {
  getItems,
  getPreviousItemIndex,
  getNextItemIndex,
  getActiveItemIndex,
  getActiveItemTranslateX,
  getActualTranslateX,
};
