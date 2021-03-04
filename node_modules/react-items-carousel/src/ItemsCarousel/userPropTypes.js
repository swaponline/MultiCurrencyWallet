import PropTypes from 'prop-types';

export default {

  /**
   * Carousel react items.
   */
  children: PropTypes.arrayOf(PropTypes.element).isRequired,

  /**
   * Number of cards to show.
   */
  numberOfCards: PropTypes.number,

  /**
   * Space between carousel items.
   */
  gutter: PropTypes.number,

  /**
   * If true a slither of next item will be showed.
   */
  showSlither: PropTypes.bool,

  /**
   * If true first and last items will have twice the space
   */
  firstAndLastGutter: PropTypes.bool,

  /**
   * Enable placeholder items while data loads
   */
  enablePlaceholder: PropTypes.bool,

  /**
   * Placeholder item. Ignored if enablePlaceholder is false.
   */
  placeholderItem: PropTypes.element,

  /**
   * Number of placeholder items. Ignored if enablePlaceholder is false.
   */
  numberOfPlaceholderItems: PropTypes.number,

  /**
   * This is called when we want to change the active item.
   * Right now we will never call this unless a left or right chevrons are clicked.
   */
  requestToChangeActive: PropTypes.func.isRequired,

  /**
   * This gives you the control to change the current active item.
   */
  activeItemIndex: PropTypes.number.isRequired,

  /**
   * The active item position.
   */
  activePosition: PropTypes.oneOf([
    'left',
    'center',
    'right',
  ]),

  /**
   * Right chevron element. If passed `requestToChangeActive` must be set.
   */
  rightChevron: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),

  /**
   * Left chevron element. If passed `requestToChangeActive` must be set.
   */
  leftChevron: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),

  /**
   * Chevron width.
   */
  chevronWidth: PropTypes.number,

  /**
   * If true the chevron will be outside the carousel.
   */
  outsideChevron: PropTypes.bool,

  /**
   * Whether or not to always show chevrons
   */
  alwaysShowChevrons: PropTypes.bool,

  /**
   * Number of slides to scroll when clicked on right or left chevron.
   */
  slidesToScroll: PropTypes.number,

  /**
   * Disabling swipe on touch devices
   */
  disableSwipe: PropTypes.bool,

  /**
   * React motion configurations.
   * [More about this here](https://github.com/chenglou/react-motion#--spring-val-number-config-springhelperconfig--opaqueconfig)
   */
  springConfig: PropTypes.shape({
    stiffness: PropTypes.number,
    damping: PropTypes.number,
    precision: PropTypes.number,
  }),

  /**
   * Function to be used to watch carousel state
   */
  onActiveStateChange: PropTypes.func,

  classes: PropTypes.shape({
    wrapper: PropTypes.string,
    itemsWrapper: PropTypes.string,
    itemsInnerWrapper: PropTypes.string,
    itemWrapper: PropTypes.string,
    rightChevronWrapper: PropTypes.string,
    leftChevronWrapper: PropTypes.string,
  }),

  /**
   * Enables infinite loop
   */
  infiniteLoop: PropTypes.bool,

  /**
   * Can be used change translateX on the spot
   */
  calculateActualTranslateX: PropTypes.func,
};
