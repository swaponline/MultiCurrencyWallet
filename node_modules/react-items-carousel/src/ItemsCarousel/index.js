import React from 'react';
import withSwipe from './withSwipe';
import withContainerWidth from './withContainerWidth';
import pipe from './pipe';
import ItemsCarouselBase from './ItemsCarouselBase';
import userPropTypes from './userPropTypes';
import withPlaceholderMode from './withPlaceholderMode';
import withCarouselValues from './withCarouselValues';
import withInfiniteLoopCarouselValues from './infiniteLoop/withInfiniteLoopCarouselValues';

const hocFuncValuesSwitcher = () => (Cpmt) => (props) => {
  const canEnableInfiniteLoop = React.Children.toArray(props.children).length >= props.numberOfCards;
  return props.infiniteLoop && canEnableInfiniteLoop ?
    withInfiniteLoopCarouselValues()(Cpmt)(props) :
    withCarouselValues()(Cpmt)(props);
}

const ItemsCarousel = pipe(
  withSwipe(),
  withPlaceholderMode(),
  hocFuncValuesSwitcher(),
  withContainerWidth(),
)(ItemsCarouselBase);

ItemsCarousel.propTypes = userPropTypes;

ItemsCarousel.defaultProps = {
  numberOfCards: 3,
  gutter: 0,
  disableSwipe: false,
  firstAndLastGutter: false,
  showSlither: false,
  enablePlaceholder: false,
  activePosition: 'left',
  slidesToScroll: 1,
  placeholderItem: null,
  numberOfPlaceholderItems: 0,
  rightChevron: null,
  leftChevron: null,
  onActiveStateChange: null,
  alwaysShowChevrons: false,
  classes: {},
  infiniteLoop: false,
  calculateActualTranslateX: translateX => translateX,
};

export default ItemsCarousel;
