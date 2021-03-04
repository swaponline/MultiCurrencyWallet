(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('prop-types'), require('react-dom')) :
  typeof define === 'function' && define.amd ? define(['react', 'prop-types', 'react-dom'], factory) :
  (global = global || self, global.Floater = factory(global.React, global.PropTypes, global.ReactDOM));
}(this, (function (React, PropTypes, ReactDOM) { 'use strict';

  var global = typeof self !== undefined ? self : this;

  React = React && React.hasOwnProperty('default') ? React['default'] : React;
  PropTypes = PropTypes && PropTypes.hasOwnProperty('default') ? PropTypes['default'] : PropTypes;
  ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = _objectWithoutPropertiesLoose(source, excluded);

    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var isRequiredIf_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports,'__esModule',{value:!0});var VALIDATOR_ARG_ERROR_MESSAGE='The typeValidator argument must be a function with the signature function(props, propName, componentName).',MESSAGE_ARG_ERROR_MESSAGE='The error message is optional, but must be a string if provided.',propIsRequired=function propIsRequired(a,b,c,d){if('boolean'==typeof a)return a;return 'function'==typeof a?a(b,c,d):!(!0!==!!a)&&!!a},propExists=function propExists(a,b){return Object.hasOwnProperty.call(a,b)},missingPropError=function missingPropError(a,b,c,d){return d?new Error(d):new Error('Required '+a[b]+' `'+b+'`'+(' was not specified in `'+c+'`.'))},guardAgainstInvalidArgTypes=function guardAgainstInvalidArgTypes(a,b){if('function'!=typeof a)throw new TypeError(VALIDATOR_ARG_ERROR_MESSAGE);if(!!b&&'string'!=typeof b)throw new TypeError(MESSAGE_ARG_ERROR_MESSAGE)},isRequiredIf=function isRequiredIf(a,b,c){return guardAgainstInvalidArgTypes(a,c),function(d,e,f){for(var _len=arguments.length,g=Array(3<_len?_len-3:0),_key=3;_key<_len;_key++)g[_key-3]=arguments[_key];return propIsRequired(b,d,e,f)?propExists(d,e)?a.apply(void 0,[d,e,f].concat(g)):missingPropError(d,e,f,c):a.apply(void 0,[d,e,f].concat(g));// Is not required, so just run typeValidator.
  }};exports.default=isRequiredIf;


  });

  var isRequiredIf = unwrapExports(isRequiredIf_1);

  /**!
   * @fileOverview Kickass library to create and place poppers near their reference elements.
   * @version 1.16.0
   * @license
   * Copyright (c) 2016 Federico Zivolo and contributors
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */
  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';

  var timeoutDuration = function () {
    var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
    for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
      if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
        return 1;
      }
    }
    return 0;
  }();

  function microtaskDebounce(fn) {
    var called = false;
    return function () {
      if (called) {
        return;
      }
      called = true;
      window.Promise.resolve().then(function () {
        called = false;
        fn();
      });
    };
  }

  function taskDebounce(fn) {
    var scheduled = false;
    return function () {
      if (!scheduled) {
        scheduled = true;
        setTimeout(function () {
          scheduled = false;
          fn();
        }, timeoutDuration);
      }
    };
  }

  var supportsMicroTasks = isBrowser && window.Promise;

  /**
  * Create a debounced version of a method, that's asynchronously deferred
  * but called in the minimum time possible.
  *
  * @method
  * @memberof Popper.Utils
  * @argument {Function} fn
  * @returns {Function}
  */
  var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

  /**
   * Check if the given variable is a function
   * @method
   * @memberof Popper.Utils
   * @argument {Any} functionToCheck - variable to check
   * @returns {Boolean} answer to: is a function?
   */
  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  /**
   * Get CSS computed property of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Eement} element
   * @argument {String} property
   */
  function getStyleComputedProperty(element, property) {
    if (element.nodeType !== 1) {
      return [];
    }
    // NOTE: 1 DOM access here
    var window = element.ownerDocument.defaultView;
    var css = window.getComputedStyle(element, null);
    return property ? css[property] : css;
  }

  /**
   * Returns the parentNode or the host of the element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} parent
   */
  function getParentNode(element) {
    if (element.nodeName === 'HTML') {
      return element;
    }
    return element.parentNode || element.host;
  }

  /**
   * Returns the scrolling parent of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} scroll parent
   */
  function getScrollParent(element) {
    // Return body, `getScroll` will take care to get the correct `scrollTop` from it
    if (!element) {
      return document.body;
    }

    switch (element.nodeName) {
      case 'HTML':
      case 'BODY':
        return element.ownerDocument.body;
      case '#document':
        return element.body;
    }

    // Firefox want us to check `-x` and `-y` variations as well

    var _getStyleComputedProp = getStyleComputedProperty(element),
        overflow = _getStyleComputedProp.overflow,
        overflowX = _getStyleComputedProp.overflowX,
        overflowY = _getStyleComputedProp.overflowY;

    if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
      return element;
    }

    return getScrollParent(getParentNode(element));
  }

  /**
   * Returns the reference node of the reference object, or the reference object itself.
   * @method
   * @memberof Popper.Utils
   * @param {Element|Object} reference - the reference element (the popper will be relative to this)
   * @returns {Element} parent
   */
  function getReferenceNode(reference) {
    return reference && reference.referenceNode ? reference.referenceNode : reference;
  }

  var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
  var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

  /**
   * Determines if the browser is Internet Explorer
   * @method
   * @memberof Popper.Utils
   * @param {Number} version to check
   * @returns {Boolean} isIE
   */
  function isIE(version) {
    if (version === 11) {
      return isIE11;
    }
    if (version === 10) {
      return isIE10;
    }
    return isIE11 || isIE10;
  }

  /**
   * Returns the offset parent of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} offset parent
   */
  function getOffsetParent(element) {
    if (!element) {
      return document.documentElement;
    }

    var noOffsetParent = isIE(10) ? document.body : null;

    // NOTE: 1 DOM access here
    var offsetParent = element.offsetParent || null;
    // Skip hidden elements which don't have an offsetParent
    while (offsetParent === noOffsetParent && element.nextElementSibling) {
      offsetParent = (element = element.nextElementSibling).offsetParent;
    }

    var nodeName = offsetParent && offsetParent.nodeName;

    if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
      return element ? element.ownerDocument.documentElement : document.documentElement;
    }

    // .offsetParent will return the closest TH, TD or TABLE in case
    // no offsetParent is present, I hate this job...
    if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
      return getOffsetParent(offsetParent);
    }

    return offsetParent;
  }

  function isOffsetContainer(element) {
    var nodeName = element.nodeName;

    if (nodeName === 'BODY') {
      return false;
    }
    return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
  }

  /**
   * Finds the root node (document, shadowDOM root) of the given element
   * @method
   * @memberof Popper.Utils
   * @argument {Element} node
   * @returns {Element} root node
   */
  function getRoot(node) {
    if (node.parentNode !== null) {
      return getRoot(node.parentNode);
    }

    return node;
  }

  /**
   * Finds the offset parent common to the two provided nodes
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element1
   * @argument {Element} element2
   * @returns {Element} common offset parent
   */
  function findCommonOffsetParent(element1, element2) {
    // This check is needed to avoid errors in case one of the elements isn't defined for any reason
    if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
      return document.documentElement;
    }

    // Here we make sure to give as "start" the element that comes first in the DOM
    var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
    var start = order ? element1 : element2;
    var end = order ? element2 : element1;

    // Get common ancestor container
    var range = document.createRange();
    range.setStart(start, 0);
    range.setEnd(end, 0);
    var commonAncestorContainer = range.commonAncestorContainer;

    // Both nodes are inside #document

    if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
      if (isOffsetContainer(commonAncestorContainer)) {
        return commonAncestorContainer;
      }

      return getOffsetParent(commonAncestorContainer);
    }

    // one of the nodes is inside shadowDOM, find which one
    var element1root = getRoot(element1);
    if (element1root.host) {
      return findCommonOffsetParent(element1root.host, element2);
    } else {
      return findCommonOffsetParent(element1, getRoot(element2).host);
    }
  }

  /**
   * Gets the scroll value of the given element in the given side (top and left)
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @argument {String} side `top` or `left`
   * @returns {number} amount of scrolled pixels
   */
  function getScroll(element) {
    var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

    var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
    var nodeName = element.nodeName;

    if (nodeName === 'BODY' || nodeName === 'HTML') {
      var html = element.ownerDocument.documentElement;
      var scrollingElement = element.ownerDocument.scrollingElement || html;
      return scrollingElement[upperSide];
    }

    return element[upperSide];
  }

  /*
   * Sum or subtract the element scroll values (left and top) from a given rect object
   * @method
   * @memberof Popper.Utils
   * @param {Object} rect - Rect object you want to change
   * @param {HTMLElement} element - The element from the function reads the scroll values
   * @param {Boolean} subtract - set to true if you want to subtract the scroll values
   * @return {Object} rect - The modifier rect object
   */
  function includeScroll(rect, element) {
    var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var scrollTop = getScroll(element, 'top');
    var scrollLeft = getScroll(element, 'left');
    var modifier = subtract ? -1 : 1;
    rect.top += scrollTop * modifier;
    rect.bottom += scrollTop * modifier;
    rect.left += scrollLeft * modifier;
    rect.right += scrollLeft * modifier;
    return rect;
  }

  /*
   * Helper to detect borders of a given element
   * @method
   * @memberof Popper.Utils
   * @param {CSSStyleDeclaration} styles
   * Result of `getStyleComputedProperty` on the given element
   * @param {String} axis - `x` or `y`
   * @return {number} borders - The borders size of the given axis
   */

  function getBordersSize(styles, axis) {
    var sideA = axis === 'x' ? 'Left' : 'Top';
    var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

    return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
  }

  function getSize(axis, body, html, computedStyle) {
    return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
  }

  function getWindowSizes(document) {
    var body = document.body;
    var html = document.documentElement;
    var computedStyle = isIE(10) && getComputedStyle(html);

    return {
      height: getSize('Height', body, html, computedStyle),
      width: getSize('Width', body, html, computedStyle)
    };
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();





  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  /**
   * Given element offsets, generate an output similar to getBoundingClientRect
   * @method
   * @memberof Popper.Utils
   * @argument {Object} offsets
   * @returns {Object} ClientRect like output
   */
  function getClientRect(offsets) {
    return _extends({}, offsets, {
      right: offsets.left + offsets.width,
      bottom: offsets.top + offsets.height
    });
  }

  /**
   * Get bounding client rect of given element
   * @method
   * @memberof Popper.Utils
   * @param {HTMLElement} element
   * @return {Object} client rect
   */
  function getBoundingClientRect(element) {
    var rect = {};

    // IE10 10 FIX: Please, don't ask, the element isn't
    // considered in DOM in some circumstances...
    // This isn't reproducible in IE10 compatibility mode of IE11
    try {
      if (isIE(10)) {
        rect = element.getBoundingClientRect();
        var scrollTop = getScroll(element, 'top');
        var scrollLeft = getScroll(element, 'left');
        rect.top += scrollTop;
        rect.left += scrollLeft;
        rect.bottom += scrollTop;
        rect.right += scrollLeft;
      } else {
        rect = element.getBoundingClientRect();
      }
    } catch (e) {}

    var result = {
      left: rect.left,
      top: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    };

    // subtract scrollbar size from sizes
    var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
    var width = sizes.width || element.clientWidth || result.width;
    var height = sizes.height || element.clientHeight || result.height;

    var horizScrollbar = element.offsetWidth - width;
    var vertScrollbar = element.offsetHeight - height;

    // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
    // we make this check conditional for performance reasons
    if (horizScrollbar || vertScrollbar) {
      var styles = getStyleComputedProperty(element);
      horizScrollbar -= getBordersSize(styles, 'x');
      vertScrollbar -= getBordersSize(styles, 'y');

      result.width -= horizScrollbar;
      result.height -= vertScrollbar;
    }

    return getClientRect(result);
  }

  function getOffsetRectRelativeToArbitraryNode(children, parent) {
    var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var isIE10 = isIE(10);
    var isHTML = parent.nodeName === 'HTML';
    var childrenRect = getBoundingClientRect(children);
    var parentRect = getBoundingClientRect(parent);
    var scrollParent = getScrollParent(children);

    var styles = getStyleComputedProperty(parent);
    var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
    var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

    // In cases where the parent is fixed, we must ignore negative scroll in offset calc
    if (fixedPosition && isHTML) {
      parentRect.top = Math.max(parentRect.top, 0);
      parentRect.left = Math.max(parentRect.left, 0);
    }
    var offsets = getClientRect({
      top: childrenRect.top - parentRect.top - borderTopWidth,
      left: childrenRect.left - parentRect.left - borderLeftWidth,
      width: childrenRect.width,
      height: childrenRect.height
    });
    offsets.marginTop = 0;
    offsets.marginLeft = 0;

    // Subtract margins of documentElement in case it's being used as parent
    // we do this only on HTML because it's the only element that behaves
    // differently when margins are applied to it. The margins are included in
    // the box of the documentElement, in the other cases not.
    if (!isIE10 && isHTML) {
      var marginTop = parseFloat(styles.marginTop, 10);
      var marginLeft = parseFloat(styles.marginLeft, 10);

      offsets.top -= borderTopWidth - marginTop;
      offsets.bottom -= borderTopWidth - marginTop;
      offsets.left -= borderLeftWidth - marginLeft;
      offsets.right -= borderLeftWidth - marginLeft;

      // Attach marginTop and marginLeft because in some circumstances we may need them
      offsets.marginTop = marginTop;
      offsets.marginLeft = marginLeft;
    }

    if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
      offsets = includeScroll(offsets, parent);
    }

    return offsets;
  }

  function getViewportOffsetRectRelativeToArtbitraryNode(element) {
    var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var html = element.ownerDocument.documentElement;
    var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
    var width = Math.max(html.clientWidth, window.innerWidth || 0);
    var height = Math.max(html.clientHeight, window.innerHeight || 0);

    var scrollTop = !excludeScroll ? getScroll(html) : 0;
    var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

    var offset = {
      top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
      left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
      width: width,
      height: height
    };

    return getClientRect(offset);
  }

  /**
   * Check if the given element is fixed or is inside a fixed parent
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @argument {Element} customContainer
   * @returns {Boolean} answer to "isFixed?"
   */
  function isFixed(element) {
    var nodeName = element.nodeName;
    if (nodeName === 'BODY' || nodeName === 'HTML') {
      return false;
    }
    if (getStyleComputedProperty(element, 'position') === 'fixed') {
      return true;
    }
    var parentNode = getParentNode(element);
    if (!parentNode) {
      return false;
    }
    return isFixed(parentNode);
  }

  /**
   * Finds the first parent of an element that has a transformed property defined
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Element} first transformed parent or documentElement
   */

  function getFixedPositionOffsetParent(element) {
    // This check is needed to avoid errors in case one of the elements isn't defined for any reason
    if (!element || !element.parentElement || isIE()) {
      return document.documentElement;
    }
    var el = element.parentElement;
    while (el && getStyleComputedProperty(el, 'transform') === 'none') {
      el = el.parentElement;
    }
    return el || document.documentElement;
  }

  /**
   * Computed the boundaries limits and return them
   * @method
   * @memberof Popper.Utils
   * @param {HTMLElement} popper
   * @param {HTMLElement} reference
   * @param {number} padding
   * @param {HTMLElement} boundariesElement - Element used to define the boundaries
   * @param {Boolean} fixedPosition - Is in fixed position mode
   * @returns {Object} Coordinates of the boundaries
   */
  function getBoundaries(popper, reference, padding, boundariesElement) {
    var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    // NOTE: 1 DOM access here

    var boundaries = { top: 0, left: 0 };
    var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));

    // Handle viewport case
    if (boundariesElement === 'viewport') {
      boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
    } else {
      // Handle other cases based on DOM element used as boundaries
      var boundariesNode = void 0;
      if (boundariesElement === 'scrollParent') {
        boundariesNode = getScrollParent(getParentNode(reference));
        if (boundariesNode.nodeName === 'BODY') {
          boundariesNode = popper.ownerDocument.documentElement;
        }
      } else if (boundariesElement === 'window') {
        boundariesNode = popper.ownerDocument.documentElement;
      } else {
        boundariesNode = boundariesElement;
      }

      var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

      // In case of HTML, we need a different computation
      if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
        var _getWindowSizes = getWindowSizes(popper.ownerDocument),
            height = _getWindowSizes.height,
            width = _getWindowSizes.width;

        boundaries.top += offsets.top - offsets.marginTop;
        boundaries.bottom = height + offsets.top;
        boundaries.left += offsets.left - offsets.marginLeft;
        boundaries.right = width + offsets.left;
      } else {
        // for all the other DOM elements, this one is good
        boundaries = offsets;
      }
    }

    // Add paddings
    padding = padding || 0;
    var isPaddingNumber = typeof padding === 'number';
    boundaries.left += isPaddingNumber ? padding : padding.left || 0;
    boundaries.top += isPaddingNumber ? padding : padding.top || 0;
    boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
    boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

    return boundaries;
  }

  function getArea(_ref) {
    var width = _ref.width,
        height = _ref.height;

    return width * height;
  }

  /**
   * Utility used to transform the `auto` placement to the placement with more
   * available space.
   * @method
   * @memberof Popper.Utils
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
    var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

    if (placement.indexOf('auto') === -1) {
      return placement;
    }

    var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

    var rects = {
      top: {
        width: boundaries.width,
        height: refRect.top - boundaries.top
      },
      right: {
        width: boundaries.right - refRect.right,
        height: boundaries.height
      },
      bottom: {
        width: boundaries.width,
        height: boundaries.bottom - refRect.bottom
      },
      left: {
        width: refRect.left - boundaries.left,
        height: boundaries.height
      }
    };

    var sortedAreas = Object.keys(rects).map(function (key) {
      return _extends({
        key: key
      }, rects[key], {
        area: getArea(rects[key])
      });
    }).sort(function (a, b) {
      return b.area - a.area;
    });

    var filteredAreas = sortedAreas.filter(function (_ref2) {
      var width = _ref2.width,
          height = _ref2.height;
      return width >= popper.clientWidth && height >= popper.clientHeight;
    });

    var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

    var variation = placement.split('-')[1];

    return computedPlacement + (variation ? '-' + variation : '');
  }

  /**
   * Get offsets to the reference element
   * @method
   * @memberof Popper.Utils
   * @param {Object} state
   * @param {Element} popper - the popper element
   * @param {Element} reference - the reference element (the popper will be relative to this)
   * @param {Element} fixedPosition - is in fixed position mode
   * @returns {Object} An object containing the offsets which will be applied to the popper
   */
  function getReferenceOffsets(state, popper, reference) {
    var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));
    return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
  }

  /**
   * Get the outer sizes of the given element (offset size + margins)
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element
   * @returns {Object} object containing width and height properties
   */
  function getOuterSizes(element) {
    var window = element.ownerDocument.defaultView;
    var styles = window.getComputedStyle(element);
    var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
    var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
    var result = {
      width: element.offsetWidth + y,
      height: element.offsetHeight + x
    };
    return result;
  }

  /**
   * Get the opposite placement of the given one
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement
   * @returns {String} flipped placement
   */
  function getOppositePlacement(placement) {
    var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash[matched];
    });
  }

  /**
   * Get offsets to the popper
   * @method
   * @memberof Popper.Utils
   * @param {Object} position - CSS position the Popper will get applied
   * @param {HTMLElement} popper - the popper element
   * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
   * @param {String} placement - one of the valid placement options
   * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
   */
  function getPopperOffsets(popper, referenceOffsets, placement) {
    placement = placement.split('-')[0];

    // Get popper node sizes
    var popperRect = getOuterSizes(popper);

    // Add position, width and height to our offsets object
    var popperOffsets = {
      width: popperRect.width,
      height: popperRect.height
    };

    // depending by the popper placement we have to compute its offsets slightly differently
    var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
    var mainSide = isHoriz ? 'top' : 'left';
    var secondarySide = isHoriz ? 'left' : 'top';
    var measurement = isHoriz ? 'height' : 'width';
    var secondaryMeasurement = !isHoriz ? 'height' : 'width';

    popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
    if (placement === secondarySide) {
      popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
    } else {
      popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
    }

    return popperOffsets;
  }

  /**
   * Mimics the `find` method of Array
   * @method
   * @memberof Popper.Utils
   * @argument {Array} arr
   * @argument prop
   * @argument value
   * @returns index or -1
   */
  function find(arr, check) {
    // use native find if supported
    if (Array.prototype.find) {
      return arr.find(check);
    }

    // use `filter` to obtain the same behavior of `find`
    return arr.filter(check)[0];
  }

  /**
   * Return the index of the matching object
   * @method
   * @memberof Popper.Utils
   * @argument {Array} arr
   * @argument prop
   * @argument value
   * @returns index or -1
   */
  function findIndex(arr, prop, value) {
    // use native findIndex if supported
    if (Array.prototype.findIndex) {
      return arr.findIndex(function (cur) {
        return cur[prop] === value;
      });
    }

    // use `find` + `indexOf` if `findIndex` isn't supported
    var match = find(arr, function (obj) {
      return obj[prop] === value;
    });
    return arr.indexOf(match);
  }

  /**
   * Loop trough the list of modifiers and run them in order,
   * each of them will then edit the data object.
   * @method
   * @memberof Popper.Utils
   * @param {dataObject} data
   * @param {Array} modifiers
   * @param {String} ends - Optional modifier name used as stopper
   * @returns {dataObject}
   */
  function runModifiers(modifiers, data, ends) {
    var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

    modifiersToRun.forEach(function (modifier) {
      if (modifier['function']) {
        // eslint-disable-line dot-notation
        console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
      }
      var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
      if (modifier.enabled && isFunction(fn)) {
        // Add properties to offsets to make them a complete clientRect object
        // we do this before each modifier to make sure the previous one doesn't
        // mess with these values
        data.offsets.popper = getClientRect(data.offsets.popper);
        data.offsets.reference = getClientRect(data.offsets.reference);

        data = fn(data, modifier);
      }
    });

    return data;
  }

  /**
   * Updates the position of the popper, computing the new offsets and applying
   * the new style.<br />
   * Prefer `scheduleUpdate` over `update` because of performance reasons.
   * @method
   * @memberof Popper
   */
  function update() {
    // if popper is destroyed, don't perform any further update
    if (this.state.isDestroyed) {
      return;
    }

    var data = {
      instance: this,
      styles: {},
      arrowStyles: {},
      attributes: {},
      flipped: false,
      offsets: {}
    };

    // compute reference element offsets
    data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

    // store the computed placement inside `originalPlacement`
    data.originalPlacement = data.placement;

    data.positionFixed = this.options.positionFixed;

    // compute the popper offsets
    data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

    data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

    // run the modifiers
    data = runModifiers(this.modifiers, data);

    // the first `update` will call `onCreate` callback
    // the other ones will call `onUpdate` callback
    if (!this.state.isCreated) {
      this.state.isCreated = true;
      this.options.onCreate(data);
    } else {
      this.options.onUpdate(data);
    }
  }

  /**
   * Helper used to know if the given modifier is enabled.
   * @method
   * @memberof Popper.Utils
   * @returns {Boolean}
   */
  function isModifierEnabled(modifiers, modifierName) {
    return modifiers.some(function (_ref) {
      var name = _ref.name,
          enabled = _ref.enabled;
      return enabled && name === modifierName;
    });
  }

  /**
   * Get the prefixed supported property name
   * @method
   * @memberof Popper.Utils
   * @argument {String} property (camelCase)
   * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
   */
  function getSupportedPropertyName(property) {
    var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
    var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

    for (var i = 0; i < prefixes.length; i++) {
      var prefix = prefixes[i];
      var toCheck = prefix ? '' + prefix + upperProp : property;
      if (typeof document.body.style[toCheck] !== 'undefined') {
        return toCheck;
      }
    }
    return null;
  }

  /**
   * Destroys the popper.
   * @method
   * @memberof Popper
   */
  function destroy() {
    this.state.isDestroyed = true;

    // touch DOM only if `applyStyle` modifier is enabled
    if (isModifierEnabled(this.modifiers, 'applyStyle')) {
      this.popper.removeAttribute('x-placement');
      this.popper.style.position = '';
      this.popper.style.top = '';
      this.popper.style.left = '';
      this.popper.style.right = '';
      this.popper.style.bottom = '';
      this.popper.style.willChange = '';
      this.popper.style[getSupportedPropertyName('transform')] = '';
    }

    this.disableEventListeners();

    // remove the popper if user explicitly asked for the deletion on destroy
    // do not use `remove` because IE11 doesn't support it
    if (this.options.removeOnDestroy) {
      this.popper.parentNode.removeChild(this.popper);
    }
    return this;
  }

  /**
   * Get the window associated with the element
   * @argument {Element} element
   * @returns {Window}
   */
  function getWindow(element) {
    var ownerDocument = element.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView : window;
  }

  function attachToScrollParents(scrollParent, event, callback, scrollParents) {
    var isBody = scrollParent.nodeName === 'BODY';
    var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
    target.addEventListener(event, callback, { passive: true });

    if (!isBody) {
      attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
    }
    scrollParents.push(target);
  }

  /**
   * Setup needed event listeners used to update the popper position
   * @method
   * @memberof Popper.Utils
   * @private
   */
  function setupEventListeners(reference, options, state, updateBound) {
    // Resize event listener on window
    state.updateBound = updateBound;
    getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

    // Scroll event listener on scroll parents
    var scrollElement = getScrollParent(reference);
    attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
    state.scrollElement = scrollElement;
    state.eventsEnabled = true;

    return state;
  }

  /**
   * It will add resize/scroll events and start recalculating
   * position of the popper element when they are triggered.
   * @method
   * @memberof Popper
   */
  function enableEventListeners() {
    if (!this.state.eventsEnabled) {
      this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
    }
  }

  /**
   * Remove event listeners used to update the popper position
   * @method
   * @memberof Popper.Utils
   * @private
   */
  function removeEventListeners(reference, state) {
    // Remove resize event listener on window
    getWindow(reference).removeEventListener('resize', state.updateBound);

    // Remove scroll event listener on scroll parents
    state.scrollParents.forEach(function (target) {
      target.removeEventListener('scroll', state.updateBound);
    });

    // Reset state
    state.updateBound = null;
    state.scrollParents = [];
    state.scrollElement = null;
    state.eventsEnabled = false;
    return state;
  }

  /**
   * It will remove resize/scroll events and won't recalculate popper position
   * when they are triggered. It also won't trigger `onUpdate` callback anymore,
   * unless you call `update` method manually.
   * @method
   * @memberof Popper
   */
  function disableEventListeners() {
    if (this.state.eventsEnabled) {
      cancelAnimationFrame(this.scheduleUpdate);
      this.state = removeEventListeners(this.reference, this.state);
    }
  }

  /**
   * Tells if a given input is a number
   * @method
   * @memberof Popper.Utils
   * @param {*} input to check
   * @return {Boolean}
   */
  function isNumeric(n) {
    return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
  }

  /**
   * Set the style to the given popper
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element - Element to apply the style to
   * @argument {Object} styles
   * Object with a list of properties and values which will be applied to the element
   */
  function setStyles(element, styles) {
    Object.keys(styles).forEach(function (prop) {
      var unit = '';
      // add unit if the value is numeric and is one of the following
      if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
        unit = 'px';
      }
      element.style[prop] = styles[prop] + unit;
    });
  }

  /**
   * Set the attributes to the given popper
   * @method
   * @memberof Popper.Utils
   * @argument {Element} element - Element to apply the attributes to
   * @argument {Object} styles
   * Object with a list of properties and values which will be applied to the element
   */
  function setAttributes(element, attributes) {
    Object.keys(attributes).forEach(function (prop) {
      var value = attributes[prop];
      if (value !== false) {
        element.setAttribute(prop, attributes[prop]);
      } else {
        element.removeAttribute(prop);
      }
    });
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} data.styles - List of style properties - values to apply to popper element
   * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The same data object
   */
  function applyStyle(data) {
    // any property present in `data.styles` will be applied to the popper,
    // in this way we can make the 3rd party modifiers add custom styles to it
    // Be aware, modifiers could override the properties defined in the previous
    // lines of this modifier!
    setStyles(data.instance.popper, data.styles);

    // any property present in `data.attributes` will be applied to the popper,
    // they will be set as HTML attributes of the element
    setAttributes(data.instance.popper, data.attributes);

    // if arrowElement is defined and arrowStyles has some properties
    if (data.arrowElement && Object.keys(data.arrowStyles).length) {
      setStyles(data.arrowElement, data.arrowStyles);
    }

    return data;
  }

  /**
   * Set the x-placement attribute before everything else because it could be used
   * to add margins to the popper margins needs to be calculated to get the
   * correct popper offsets.
   * @method
   * @memberof Popper.modifiers
   * @param {HTMLElement} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as popper
   * @param {Object} options - Popper.js options
   */
  function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
    // compute reference element offsets
    var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

    popper.setAttribute('x-placement', placement);

    // Apply `position` to popper before anything else because
    // without the position applied we can't guarantee correct computations
    setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

    return options;
  }

  /**
   * @function
   * @memberof Popper.Utils
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Boolean} shouldRound - If the offsets should be rounded at all
   * @returns {Object} The popper's position offsets rounded
   *
   * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
   * good as it can be within reason.
   * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
   *
   * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
   * as well on High DPI screens).
   *
   * Firefox prefers no rounding for positioning and does not have blurriness on
   * high DPI screens.
   *
   * Only horizontal placement and left/right values need to be considered.
   */
  function getRoundedOffsets(data, shouldRound) {
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;
    var round = Math.round,
        floor = Math.floor;

    var noRound = function noRound(v) {
      return v;
    };

    var referenceWidth = round(reference.width);
    var popperWidth = round(popper.width);

    var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
    var isVariation = data.placement.indexOf('-') !== -1;
    var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
    var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

    var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
    var verticalToInteger = !shouldRound ? noRound : round;

    return {
      left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
      top: verticalToInteger(popper.top),
      bottom: verticalToInteger(popper.bottom),
      right: horizontalToInteger(popper.right)
    };
  }

  var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function computeStyle(data, options) {
    var x = options.x,
        y = options.y;
    var popper = data.offsets.popper;

    // Remove this legacy support in Popper.js v2

    var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
      return modifier.name === 'applyStyle';
    }).gpuAcceleration;
    if (legacyGpuAccelerationOption !== undefined) {
      console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
    }
    var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

    var offsetParent = getOffsetParent(data.instance.popper);
    var offsetParentRect = getBoundingClientRect(offsetParent);

    // Styles
    var styles = {
      position: popper.position
    };

    var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

    var sideA = x === 'bottom' ? 'top' : 'bottom';
    var sideB = y === 'right' ? 'left' : 'right';

    // if gpuAcceleration is set to `true` and transform is supported,
    //  we use `translate3d` to apply the position to the popper we
    // automatically use the supported prefixed version if needed
    var prefixedProperty = getSupportedPropertyName('transform');

    // now, let's make a step back and look at this code closely (wtf?)
    // If the content of the popper grows once it's been positioned, it
    // may happen that the popper gets misplaced because of the new content
    // overflowing its reference element
    // To avoid this problem, we provide two options (x and y), which allow
    // the consumer to define the offset origin.
    // If we position a popper on top of a reference element, we can set
    // `x` to `top` to make the popper grow towards its top instead of
    // its bottom.
    var left = void 0,
        top = void 0;
    if (sideA === 'bottom') {
      // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
      // and not the bottom of the html element
      if (offsetParent.nodeName === 'HTML') {
        top = -offsetParent.clientHeight + offsets.bottom;
      } else {
        top = -offsetParentRect.height + offsets.bottom;
      }
    } else {
      top = offsets.top;
    }
    if (sideB === 'right') {
      if (offsetParent.nodeName === 'HTML') {
        left = -offsetParent.clientWidth + offsets.right;
      } else {
        left = -offsetParentRect.width + offsets.right;
      }
    } else {
      left = offsets.left;
    }
    if (gpuAcceleration && prefixedProperty) {
      styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
      styles[sideA] = 0;
      styles[sideB] = 0;
      styles.willChange = 'transform';
    } else {
      // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
      var invertTop = sideA === 'bottom' ? -1 : 1;
      var invertLeft = sideB === 'right' ? -1 : 1;
      styles[sideA] = top * invertTop;
      styles[sideB] = left * invertLeft;
      styles.willChange = sideA + ', ' + sideB;
    }

    // Attributes
    var attributes = {
      'x-placement': data.placement
    };

    // Update `data` attributes, styles and arrowStyles
    data.attributes = _extends({}, attributes, data.attributes);
    data.styles = _extends({}, styles, data.styles);
    data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

    return data;
  }

  /**
   * Helper used to know if the given modifier depends from another one.<br />
   * It checks if the needed modifier is listed and enabled.
   * @method
   * @memberof Popper.Utils
   * @param {Array} modifiers - list of modifiers
   * @param {String} requestingName - name of requesting modifier
   * @param {String} requestedName - name of requested modifier
   * @returns {Boolean}
   */
  function isModifierRequired(modifiers, requestingName, requestedName) {
    var requesting = find(modifiers, function (_ref) {
      var name = _ref.name;
      return name === requestingName;
    });

    var isRequired = !!requesting && modifiers.some(function (modifier) {
      return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
    });

    if (!isRequired) {
      var _requesting = '`' + requestingName + '`';
      var requested = '`' + requestedName + '`';
      console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
    }
    return isRequired;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function arrow(data, options) {
    var _data$offsets$arrow;

    // arrow depends on keepTogether in order to work
    if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
      return data;
    }

    var arrowElement = options.element;

    // if arrowElement is a string, suppose it's a CSS selector
    if (typeof arrowElement === 'string') {
      arrowElement = data.instance.popper.querySelector(arrowElement);

      // if arrowElement is not found, don't run the modifier
      if (!arrowElement) {
        return data;
      }
    } else {
      // if the arrowElement isn't a query selector we must check that the
      // provided DOM node is child of its popper node
      if (!data.instance.popper.contains(arrowElement)) {
        console.warn('WARNING: `arrow.element` must be child of its popper element!');
        return data;
      }
    }

    var placement = data.placement.split('-')[0];
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var isVertical = ['left', 'right'].indexOf(placement) !== -1;

    var len = isVertical ? 'height' : 'width';
    var sideCapitalized = isVertical ? 'Top' : 'Left';
    var side = sideCapitalized.toLowerCase();
    var altSide = isVertical ? 'left' : 'top';
    var opSide = isVertical ? 'bottom' : 'right';
    var arrowElementSize = getOuterSizes(arrowElement)[len];

    //
    // extends keepTogether behavior making sure the popper and its
    // reference have enough pixels in conjunction
    //

    // top/left side
    if (reference[opSide] - arrowElementSize < popper[side]) {
      data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
    }
    // bottom/right side
    if (reference[side] + arrowElementSize > popper[opSide]) {
      data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
    }
    data.offsets.popper = getClientRect(data.offsets.popper);

    // compute center of the popper
    var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

    // Compute the sideValue using the updated popper offsets
    // take popper margin in account because we don't have this info available
    var css = getStyleComputedProperty(data.instance.popper);
    var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
    var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
    var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

    // prevent arrowElement from being placed not contiguously to its popper
    sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

    data.arrowElement = arrowElement;
    data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

    return data;
  }

  /**
   * Get the opposite placement variation of the given one
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement variation
   * @returns {String} flipped placement variation
   */
  function getOppositeVariation(variation) {
    if (variation === 'end') {
      return 'start';
    } else if (variation === 'start') {
      return 'end';
    }
    return variation;
  }

  /**
   * List of accepted placements to use as values of the `placement` option.<br />
   * Valid placements are:
   * - `auto`
   * - `top`
   * - `right`
   * - `bottom`
   * - `left`
   *
   * Each placement can have a variation from this list:
   * - `-start`
   * - `-end`
   *
   * Variations are interpreted easily if you think of them as the left to right
   * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
   * is right.<br />
   * Vertically (`left` and `right`), `start` is top and `end` is bottom.
   *
   * Some valid examples are:
   * - `top-end` (on top of reference, right aligned)
   * - `right-start` (on right of reference, top aligned)
   * - `bottom` (on bottom, centered)
   * - `auto-end` (on the side with more space available, alignment depends by placement)
   *
   * @static
   * @type {Array}
   * @enum {String}
   * @readonly
   * @method placements
   * @memberof Popper
   */
  var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

  // Get rid of `auto` `auto-start` and `auto-end`
  var validPlacements = placements.slice(3);

  /**
   * Given an initial placement, returns all the subsequent placements
   * clockwise (or counter-clockwise).
   *
   * @method
   * @memberof Popper.Utils
   * @argument {String} placement - A valid placement (it accepts variations)
   * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
   * @returns {Array} placements including their variations
   */
  function clockwise(placement) {
    var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var index = validPlacements.indexOf(placement);
    var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
    return counter ? arr.reverse() : arr;
  }

  var BEHAVIORS = {
    FLIP: 'flip',
    CLOCKWISE: 'clockwise',
    COUNTERCLOCKWISE: 'counterclockwise'
  };

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function flip(data, options) {
    // if `inner` modifier is enabled, we can't use the `flip` modifier
    if (isModifierEnabled(data.instance.modifiers, 'inner')) {
      return data;
    }

    if (data.flipped && data.placement === data.originalPlacement) {
      // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
      return data;
    }

    var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

    var placement = data.placement.split('-')[0];
    var placementOpposite = getOppositePlacement(placement);
    var variation = data.placement.split('-')[1] || '';

    var flipOrder = [];

    switch (options.behavior) {
      case BEHAVIORS.FLIP:
        flipOrder = [placement, placementOpposite];
        break;
      case BEHAVIORS.CLOCKWISE:
        flipOrder = clockwise(placement);
        break;
      case BEHAVIORS.COUNTERCLOCKWISE:
        flipOrder = clockwise(placement, true);
        break;
      default:
        flipOrder = options.behavior;
    }

    flipOrder.forEach(function (step, index) {
      if (placement !== step || flipOrder.length === index + 1) {
        return data;
      }

      placement = data.placement.split('-')[0];
      placementOpposite = getOppositePlacement(placement);

      var popperOffsets = data.offsets.popper;
      var refOffsets = data.offsets.reference;

      // using floor because the reference offsets may contain decimals we are not going to consider here
      var floor = Math.floor;
      var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

      var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
      var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
      var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
      var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

      var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

      // flip the variation if required
      var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

      // flips variation if reference element overflows boundaries
      var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

      // flips variation if popper content overflows boundaries
      var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

      var flippedVariation = flippedVariationByRef || flippedVariationByContent;

      if (overlapsRef || overflowsBoundaries || flippedVariation) {
        // this boolean to detect any flip loop
        data.flipped = true;

        if (overlapsRef || overflowsBoundaries) {
          placement = flipOrder[index + 1];
        }

        if (flippedVariation) {
          variation = getOppositeVariation(variation);
        }

        data.placement = placement + (variation ? '-' + variation : '');

        // this object contains `position`, we want to preserve it along with
        // any additional property we may add in the future
        data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

        data = runModifiers(data.instance.modifiers, data, 'flip');
      }
    });
    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function keepTogether(data) {
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var placement = data.placement.split('-')[0];
    var floor = Math.floor;
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    var side = isVertical ? 'right' : 'bottom';
    var opSide = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    if (popper[side] < floor(reference[opSide])) {
      data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
    }
    if (popper[opSide] > floor(reference[side])) {
      data.offsets.popper[opSide] = floor(reference[side]);
    }

    return data;
  }

  /**
   * Converts a string containing value + unit into a px value number
   * @function
   * @memberof {modifiers~offset}
   * @private
   * @argument {String} str - Value + unit string
   * @argument {String} measurement - `height` or `width`
   * @argument {Object} popperOffsets
   * @argument {Object} referenceOffsets
   * @returns {Number|String}
   * Value in pixels, or original string if no values were extracted
   */
  function toValue(str, measurement, popperOffsets, referenceOffsets) {
    // separate value from unit
    var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
    var value = +split[1];
    var unit = split[2];

    // If it's not a number it's an operator, I guess
    if (!value) {
      return str;
    }

    if (unit.indexOf('%') === 0) {
      var element = void 0;
      switch (unit) {
        case '%p':
          element = popperOffsets;
          break;
        case '%':
        case '%r':
        default:
          element = referenceOffsets;
      }

      var rect = getClientRect(element);
      return rect[measurement] / 100 * value;
    } else if (unit === 'vh' || unit === 'vw') {
      // if is a vh or vw, we calculate the size based on the viewport
      var size = void 0;
      if (unit === 'vh') {
        size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      } else {
        size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      }
      return size / 100 * value;
    } else {
      // if is an explicit pixel unit, we get rid of the unit and keep the value
      // if is an implicit unit, it's px, and we return just the value
      return value;
    }
  }

  /**
   * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
   * @function
   * @memberof {modifiers~offset}
   * @private
   * @argument {String} offset
   * @argument {Object} popperOffsets
   * @argument {Object} referenceOffsets
   * @argument {String} basePlacement
   * @returns {Array} a two cells array with x and y offsets in numbers
   */
  function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
    var offsets = [0, 0];

    // Use height if placement is left or right and index is 0 otherwise use width
    // in this way the first offset will use an axis and the second one
    // will use the other one
    var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

    // Split the offset string to obtain a list of values and operands
    // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
    var fragments = offset.split(/(\+|\-)/).map(function (frag) {
      return frag.trim();
    });

    // Detect if the offset string contains a pair of values or a single one
    // they could be separated by comma or space
    var divider = fragments.indexOf(find(fragments, function (frag) {
      return frag.search(/,|\s/) !== -1;
    }));

    if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
      console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
    }

    // If divider is found, we divide the list of values and operands to divide
    // them by ofset X and Y.
    var splitRegex = /\s*,\s*|\s+/;
    var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

    // Convert the values with units to absolute pixels to allow our computations
    ops = ops.map(function (op, index) {
      // Most of the units rely on the orientation of the popper
      var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
      var mergeWithPrevious = false;
      return op
      // This aggregates any `+` or `-` sign that aren't considered operators
      // e.g.: 10 + +5 => [10, +, +5]
      .reduce(function (a, b) {
        if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
          a[a.length - 1] = b;
          mergeWithPrevious = true;
          return a;
        } else if (mergeWithPrevious) {
          a[a.length - 1] += b;
          mergeWithPrevious = false;
          return a;
        } else {
          return a.concat(b);
        }
      }, [])
      // Here we convert the string values into number values (in px)
      .map(function (str) {
        return toValue(str, measurement, popperOffsets, referenceOffsets);
      });
    });

    // Loop trough the offsets arrays and execute the operations
    ops.forEach(function (op, index) {
      op.forEach(function (frag, index2) {
        if (isNumeric(frag)) {
          offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
        }
      });
    });
    return offsets;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @argument {Number|String} options.offset=0
   * The offset value as described in the modifier description
   * @returns {Object} The data object, properly modified
   */
  function offset(data, _ref) {
    var offset = _ref.offset;
    var placement = data.placement,
        _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var basePlacement = placement.split('-')[0];

    var offsets = void 0;
    if (isNumeric(+offset)) {
      offsets = [+offset, 0];
    } else {
      offsets = parseOffset(offset, popper, reference, basePlacement);
    }

    if (basePlacement === 'left') {
      popper.top += offsets[0];
      popper.left -= offsets[1];
    } else if (basePlacement === 'right') {
      popper.top += offsets[0];
      popper.left += offsets[1];
    } else if (basePlacement === 'top') {
      popper.left += offsets[0];
      popper.top -= offsets[1];
    } else if (basePlacement === 'bottom') {
      popper.left += offsets[0];
      popper.top += offsets[1];
    }

    data.popper = popper;
    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function preventOverflow(data, options) {
    var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

    // If offsetParent is the reference element, we really want to
    // go one step up and use the next offsetParent as reference to
    // avoid to make this modifier completely useless and look like broken
    if (data.instance.reference === boundariesElement) {
      boundariesElement = getOffsetParent(boundariesElement);
    }

    // NOTE: DOM access here
    // resets the popper's position so that the document size can be calculated excluding
    // the size of the popper element itself
    var transformProp = getSupportedPropertyName('transform');
    var popperStyles = data.instance.popper.style; // assignment to help minification
    var top = popperStyles.top,
        left = popperStyles.left,
        transform = popperStyles[transformProp];

    popperStyles.top = '';
    popperStyles.left = '';
    popperStyles[transformProp] = '';

    var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

    // NOTE: DOM access here
    // restores the original style properties after the offsets have been computed
    popperStyles.top = top;
    popperStyles.left = left;
    popperStyles[transformProp] = transform;

    options.boundaries = boundaries;

    var order = options.priority;
    var popper = data.offsets.popper;

    var check = {
      primary: function primary(placement) {
        var value = popper[placement];
        if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
          value = Math.max(popper[placement], boundaries[placement]);
        }
        return defineProperty({}, placement, value);
      },
      secondary: function secondary(placement) {
        var mainSide = placement === 'right' ? 'left' : 'top';
        var value = popper[mainSide];
        if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
          value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
        }
        return defineProperty({}, mainSide, value);
      }
    };

    order.forEach(function (placement) {
      var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
      popper = _extends({}, popper, check[side](placement));
    });

    data.offsets.popper = popper;

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function shift(data) {
    var placement = data.placement;
    var basePlacement = placement.split('-')[0];
    var shiftvariation = placement.split('-')[1];

    // if shift shiftvariation is specified, run the modifier
    if (shiftvariation) {
      var _data$offsets = data.offsets,
          reference = _data$offsets.reference,
          popper = _data$offsets.popper;

      var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
      var side = isVertical ? 'left' : 'top';
      var measurement = isVertical ? 'width' : 'height';

      var shiftOffsets = {
        start: defineProperty({}, side, reference[side]),
        end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
      };

      data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
    }

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by update method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function hide(data) {
    if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
      return data;
    }

    var refRect = data.offsets.reference;
    var bound = find(data.instance.modifiers, function (modifier) {
      return modifier.name === 'preventOverflow';
    }).boundaries;

    if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
      // Avoid unnecessary DOM access if visibility hasn't changed
      if (data.hide === true) {
        return data;
      }

      data.hide = true;
      data.attributes['x-out-of-boundaries'] = '';
    } else {
      // Avoid unnecessary DOM access if visibility hasn't changed
      if (data.hide === false) {
        return data;
      }

      data.hide = false;
      data.attributes['x-out-of-boundaries'] = false;
    }

    return data;
  }

  /**
   * @function
   * @memberof Modifiers
   * @argument {Object} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {Object} The data object, properly modified
   */
  function inner(data) {
    var placement = data.placement;
    var basePlacement = placement.split('-')[0];
    var _data$offsets = data.offsets,
        popper = _data$offsets.popper,
        reference = _data$offsets.reference;

    var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

    var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

    popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

    data.placement = getOppositePlacement(placement);
    data.offsets.popper = getClientRect(popper);

    return data;
  }

  /**
   * Modifier function, each modifier can have a function of this type assigned
   * to its `fn` property.<br />
   * These functions will be called on each update, this means that you must
   * make sure they are performant enough to avoid performance bottlenecks.
   *
   * @function ModifierFn
   * @argument {dataObject} data - The data object generated by `update` method
   * @argument {Object} options - Modifiers configuration and options
   * @returns {dataObject} The data object, properly modified
   */

  /**
   * Modifiers are plugins used to alter the behavior of your poppers.<br />
   * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
   * needed by the library.
   *
   * Usually you don't want to override the `order`, `fn` and `onLoad` props.
   * All the other properties are configurations that could be tweaked.
   * @namespace modifiers
   */
  var modifiers = {
    /**
     * Modifier used to shift the popper on the start or end of its reference
     * element.<br />
     * It will read the variation of the `placement` property.<br />
     * It can be one either `-end` or `-start`.
     * @memberof modifiers
     * @inner
     */
    shift: {
      /** @prop {number} order=100 - Index used to define the order of execution */
      order: 100,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: shift
    },

    /**
     * The `offset` modifier can shift your popper on both its axis.
     *
     * It accepts the following units:
     * - `px` or unit-less, interpreted as pixels
     * - `%` or `%r`, percentage relative to the length of the reference element
     * - `%p`, percentage relative to the length of the popper element
     * - `vw`, CSS viewport width unit
     * - `vh`, CSS viewport height unit
     *
     * For length is intended the main axis relative to the placement of the popper.<br />
     * This means that if the placement is `top` or `bottom`, the length will be the
     * `width`. In case of `left` or `right`, it will be the `height`.
     *
     * You can provide a single value (as `Number` or `String`), or a pair of values
     * as `String` divided by a comma or one (or more) white spaces.<br />
     * The latter is a deprecated method because it leads to confusion and will be
     * removed in v2.<br />
     * Additionally, it accepts additions and subtractions between different units.
     * Note that multiplications and divisions aren't supported.
     *
     * Valid examples are:
     * ```
     * 10
     * '10%'
     * '10, 10'
     * '10%, 10'
     * '10 + 10%'
     * '10 - 5vh + 3%'
     * '-10px + 5vh, 5px - 6%'
     * ```
     * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
     * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
     * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
     *
     * @memberof modifiers
     * @inner
     */
    offset: {
      /** @prop {number} order=200 - Index used to define the order of execution */
      order: 200,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: offset,
      /** @prop {Number|String} offset=0
       * The offset value as described in the modifier description
       */
      offset: 0
    },

    /**
     * Modifier used to prevent the popper from being positioned outside the boundary.
     *
     * A scenario exists where the reference itself is not within the boundaries.<br />
     * We can say it has "escaped the boundaries" — or just "escaped".<br />
     * In this case we need to decide whether the popper should either:
     *
     * - detach from the reference and remain "trapped" in the boundaries, or
     * - if it should ignore the boundary and "escape with its reference"
     *
     * When `escapeWithReference` is set to`true` and reference is completely
     * outside its boundaries, the popper will overflow (or completely leave)
     * the boundaries in order to remain attached to the edge of the reference.
     *
     * @memberof modifiers
     * @inner
     */
    preventOverflow: {
      /** @prop {number} order=300 - Index used to define the order of execution */
      order: 300,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: preventOverflow,
      /**
       * @prop {Array} [priority=['left','right','top','bottom']]
       * Popper will try to prevent overflow following these priorities by default,
       * then, it could overflow on the left and on top of the `boundariesElement`
       */
      priority: ['left', 'right', 'top', 'bottom'],
      /**
       * @prop {number} padding=5
       * Amount of pixel used to define a minimum distance between the boundaries
       * and the popper. This makes sure the popper always has a little padding
       * between the edges of its container
       */
      padding: 5,
      /**
       * @prop {String|HTMLElement} boundariesElement='scrollParent'
       * Boundaries used by the modifier. Can be `scrollParent`, `window`,
       * `viewport` or any DOM element.
       */
      boundariesElement: 'scrollParent'
    },

    /**
     * Modifier used to make sure the reference and its popper stay near each other
     * without leaving any gap between the two. Especially useful when the arrow is
     * enabled and you want to ensure that it points to its reference element.
     * It cares only about the first axis. You can still have poppers with margin
     * between the popper and its reference element.
     * @memberof modifiers
     * @inner
     */
    keepTogether: {
      /** @prop {number} order=400 - Index used to define the order of execution */
      order: 400,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: keepTogether
    },

    /**
     * This modifier is used to move the `arrowElement` of the popper to make
     * sure it is positioned between the reference element and its popper element.
     * It will read the outer size of the `arrowElement` node to detect how many
     * pixels of conjunction are needed.
     *
     * It has no effect if no `arrowElement` is provided.
     * @memberof modifiers
     * @inner
     */
    arrow: {
      /** @prop {number} order=500 - Index used to define the order of execution */
      order: 500,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: arrow,
      /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
      element: '[x-arrow]'
    },

    /**
     * Modifier used to flip the popper's placement when it starts to overlap its
     * reference element.
     *
     * Requires the `preventOverflow` modifier before it in order to work.
     *
     * **NOTE:** this modifier will interrupt the current update cycle and will
     * restart it if it detects the need to flip the placement.
     * @memberof modifiers
     * @inner
     */
    flip: {
      /** @prop {number} order=600 - Index used to define the order of execution */
      order: 600,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: flip,
      /**
       * @prop {String|Array} behavior='flip'
       * The behavior used to change the popper's placement. It can be one of
       * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
       * placements (with optional variations)
       */
      behavior: 'flip',
      /**
       * @prop {number} padding=5
       * The popper will flip if it hits the edges of the `boundariesElement`
       */
      padding: 5,
      /**
       * @prop {String|HTMLElement} boundariesElement='viewport'
       * The element which will define the boundaries of the popper position.
       * The popper will never be placed outside of the defined boundaries
       * (except if `keepTogether` is enabled)
       */
      boundariesElement: 'viewport',
      /**
       * @prop {Boolean} flipVariations=false
       * The popper will switch placement variation between `-start` and `-end` when
       * the reference element overlaps its boundaries.
       *
       * The original placement should have a set variation.
       */
      flipVariations: false,
      /**
       * @prop {Boolean} flipVariationsByContent=false
       * The popper will switch placement variation between `-start` and `-end` when
       * the popper element overlaps its reference boundaries.
       *
       * The original placement should have a set variation.
       */
      flipVariationsByContent: false
    },

    /**
     * Modifier used to make the popper flow toward the inner of the reference element.
     * By default, when this modifier is disabled, the popper will be placed outside
     * the reference element.
     * @memberof modifiers
     * @inner
     */
    inner: {
      /** @prop {number} order=700 - Index used to define the order of execution */
      order: 700,
      /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
      enabled: false,
      /** @prop {ModifierFn} */
      fn: inner
    },

    /**
     * Modifier used to hide the popper when its reference element is outside of the
     * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
     * be used to hide with a CSS selector the popper when its reference is
     * out of boundaries.
     *
     * Requires the `preventOverflow` modifier before it in order to work.
     * @memberof modifiers
     * @inner
     */
    hide: {
      /** @prop {number} order=800 - Index used to define the order of execution */
      order: 800,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: hide
    },

    /**
     * Computes the style that will be applied to the popper element to gets
     * properly positioned.
     *
     * Note that this modifier will not touch the DOM, it just prepares the styles
     * so that `applyStyle` modifier can apply it. This separation is useful
     * in case you need to replace `applyStyle` with a custom implementation.
     *
     * This modifier has `850` as `order` value to maintain backward compatibility
     * with previous versions of Popper.js. Expect the modifiers ordering method
     * to change in future major versions of the library.
     *
     * @memberof modifiers
     * @inner
     */
    computeStyle: {
      /** @prop {number} order=850 - Index used to define the order of execution */
      order: 850,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: computeStyle,
      /**
       * @prop {Boolean} gpuAcceleration=true
       * If true, it uses the CSS 3D transformation to position the popper.
       * Otherwise, it will use the `top` and `left` properties
       */
      gpuAcceleration: true,
      /**
       * @prop {string} [x='bottom']
       * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
       * Change this if your popper should grow in a direction different from `bottom`
       */
      x: 'bottom',
      /**
       * @prop {string} [x='left']
       * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
       * Change this if your popper should grow in a direction different from `right`
       */
      y: 'right'
    },

    /**
     * Applies the computed styles to the popper element.
     *
     * All the DOM manipulations are limited to this modifier. This is useful in case
     * you want to integrate Popper.js inside a framework or view library and you
     * want to delegate all the DOM manipulations to it.
     *
     * Note that if you disable this modifier, you must make sure the popper element
     * has its position set to `absolute` before Popper.js can do its work!
     *
     * Just disable this modifier and define your own to achieve the desired effect.
     *
     * @memberof modifiers
     * @inner
     */
    applyStyle: {
      /** @prop {number} order=900 - Index used to define the order of execution */
      order: 900,
      /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
      enabled: true,
      /** @prop {ModifierFn} */
      fn: applyStyle,
      /** @prop {Function} */
      onLoad: applyStyleOnLoad,
      /**
       * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
       * @prop {Boolean} gpuAcceleration=true
       * If true, it uses the CSS 3D transformation to position the popper.
       * Otherwise, it will use the `top` and `left` properties
       */
      gpuAcceleration: undefined
    }
  };

  /**
   * The `dataObject` is an object containing all the information used by Popper.js.
   * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
   * @name dataObject
   * @property {Object} data.instance The Popper.js instance
   * @property {String} data.placement Placement applied to popper
   * @property {String} data.originalPlacement Placement originally defined on init
   * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
   * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
   * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
   * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
   * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
   * @property {Object} data.boundaries Offsets of the popper boundaries
   * @property {Object} data.offsets The measurements of popper, reference and arrow elements
   * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
   * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
   * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
   */

  /**
   * Default options provided to Popper.js constructor.<br />
   * These can be overridden using the `options` argument of Popper.js.<br />
   * To override an option, simply pass an object with the same
   * structure of the `options` object, as the 3rd argument. For example:
   * ```
   * new Popper(ref, pop, {
   *   modifiers: {
   *     preventOverflow: { enabled: false }
   *   }
   * })
   * ```
   * @type {Object}
   * @static
   * @memberof Popper
   */
  var Defaults = {
    /**
     * Popper's placement.
     * @prop {Popper.placements} placement='bottom'
     */
    placement: 'bottom',

    /**
     * Set this to true if you want popper to position it self in 'fixed' mode
     * @prop {Boolean} positionFixed=false
     */
    positionFixed: false,

    /**
     * Whether events (resize, scroll) are initially enabled.
     * @prop {Boolean} eventsEnabled=true
     */
    eventsEnabled: true,

    /**
     * Set to true if you want to automatically remove the popper when
     * you call the `destroy` method.
     * @prop {Boolean} removeOnDestroy=false
     */
    removeOnDestroy: false,

    /**
     * Callback called when the popper is created.<br />
     * By default, it is set to no-op.<br />
     * Access Popper.js instance with `data.instance`.
     * @prop {onCreate}
     */
    onCreate: function onCreate() {},

    /**
     * Callback called when the popper is updated. This callback is not called
     * on the initialization/creation of the popper, but only on subsequent
     * updates.<br />
     * By default, it is set to no-op.<br />
     * Access Popper.js instance with `data.instance`.
     * @prop {onUpdate}
     */
    onUpdate: function onUpdate() {},

    /**
     * List of modifiers used to modify the offsets before they are applied to the popper.
     * They provide most of the functionalities of Popper.js.
     * @prop {modifiers}
     */
    modifiers: modifiers
  };

  /**
   * @callback onCreate
   * @param {dataObject} data
   */

  /**
   * @callback onUpdate
   * @param {dataObject} data
   */

  // Utils
  // Methods
  var Popper = function () {
    /**
     * Creates a new Popper.js instance.
     * @class Popper
     * @param {Element|referenceObject} reference - The reference element used to position the popper
     * @param {Element} popper - The HTML / XML element used as the popper
     * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
     * @return {Object} instance - The generated Popper.js instance
     */
    function Popper(reference, popper) {
      var _this = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      classCallCheck(this, Popper);

      this.scheduleUpdate = function () {
        return requestAnimationFrame(_this.update);
      };

      // make update() debounced, so that it only runs at most once-per-tick
      this.update = debounce(this.update.bind(this));

      // with {} we create a new object with the options inside it
      this.options = _extends({}, Popper.Defaults, options);

      // init state
      this.state = {
        isDestroyed: false,
        isCreated: false,
        scrollParents: []
      };

      // get reference and popper elements (allow jQuery wrappers)
      this.reference = reference && reference.jquery ? reference[0] : reference;
      this.popper = popper && popper.jquery ? popper[0] : popper;

      // Deep merge modifiers options
      this.options.modifiers = {};
      Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
        _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
      });

      // Refactoring modifiers' list (Object => Array)
      this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
        return _extends({
          name: name
        }, _this.options.modifiers[name]);
      })
      // sort the modifiers by order
      .sort(function (a, b) {
        return a.order - b.order;
      });

      // modifiers have the ability to execute arbitrary code when Popper.js get inited
      // such code is executed in the same order of its modifier
      // they could add new properties to their options configuration
      // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
      this.modifiers.forEach(function (modifierOptions) {
        if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
          modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
        }
      });

      // fire the first update to position the popper in the right place
      this.update();

      var eventsEnabled = this.options.eventsEnabled;
      if (eventsEnabled) {
        // setup event listeners, they will take care of update the position in specific situations
        this.enableEventListeners();
      }

      this.state.eventsEnabled = eventsEnabled;
    }

    // We can't use class properties because they don't get listed in the
    // class prototype and break stuff like Sinon stubs


    createClass(Popper, [{
      key: 'update',
      value: function update$$1() {
        return update.call(this);
      }
    }, {
      key: 'destroy',
      value: function destroy$$1() {
        return destroy.call(this);
      }
    }, {
      key: 'enableEventListeners',
      value: function enableEventListeners$$1() {
        return enableEventListeners.call(this);
      }
    }, {
      key: 'disableEventListeners',
      value: function disableEventListeners$$1() {
        return disableEventListeners.call(this);
      }

      /**
       * Schedules an update. It will run on the next UI update available.
       * @method scheduleUpdate
       * @memberof Popper
       */


      /**
       * Collection of utilities useful when writing custom modifiers.
       * Starting from version 1.7, this method is available only if you
       * include `popper-utils.js` before `popper.js`.
       *
       * **DEPRECATION**: This way to access PopperUtils is deprecated
       * and will be removed in v2! Use the PopperUtils module directly instead.
       * Due to the high instability of the methods contained in Utils, we can't
       * guarantee them to follow semver. Use them at your own risk!
       * @static
       * @private
       * @type {Object}
       * @deprecated since version 1.8
       * @member Utils
       * @memberof Popper
       */

    }]);
    return Popper;
  }();

  /**
   * The `referenceObject` is an object that provides an interface compatible with Popper.js
   * and lets you use it as replacement of a real DOM node.<br />
   * You can use this method to position a popper relatively to a set of coordinates
   * in case you don't have a DOM node to use as reference.
   *
   * ```
   * new Popper(referenceObject, popperNode);
   * ```
   *
   * NB: This feature isn't supported in Internet Explorer 10.
   * @name referenceObject
   * @property {Function} data.getBoundingClientRect
   * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
   * @property {number} data.clientWidth
   * An ES6 getter that will return the width of the virtual reference element.
   * @property {number} data.clientHeight
   * An ES6 getter that will return the height of the virtual reference element.
   */


  Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
  Popper.placements = placements;
  Popper.Defaults = Defaults;

  var isMergeableObject = function isMergeableObject(value) {
  	return isNonNullObject(value)
  		&& !isSpecial(value)
  };

  function isNonNullObject(value) {
  	return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
  	var stringValue = Object.prototype.toString.call(value);

  	return stringValue === '[object RegExp]'
  		|| stringValue === '[object Date]'
  		|| isReactElement(value)
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
  	return value.$$typeof === REACT_ELEMENT_TYPE
  }

  function emptyTarget(val) {
  	return Array.isArray(val) ? [] : {}
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
  	return (options.clone !== false && options.isMergeableObject(value))
  		? deepmerge(emptyTarget(value), value, options)
  		: value
  }

  function defaultArrayMerge(target, source, options) {
  	return target.concat(source).map(function(element) {
  		return cloneUnlessOtherwiseSpecified(element, options)
  	})
  }

  function getMergeFunction(key, options) {
  	if (!options.customMerge) {
  		return deepmerge
  	}
  	var customMerge = options.customMerge(key);
  	return typeof customMerge === 'function' ? customMerge : deepmerge
  }

  function getEnumerableOwnPropertySymbols(target) {
  	return Object.getOwnPropertySymbols
  		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
  			return target.propertyIsEnumerable(symbol)
  		})
  		: []
  }

  function getKeys(target) {
  	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
  }

  function propertyIsOnObject(object, property) {
  	try {
  		return property in object
  	} catch(_) {
  		return false
  	}
  }

  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
  	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
  		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
  			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
  	var destination = {};
  	if (options.isMergeableObject(target)) {
  		getKeys(target).forEach(function(key) {
  			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
  		});
  	}
  	getKeys(source).forEach(function(key) {
  		if (propertyIsUnsafe(target, key)) {
  			return
  		}

  		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
  			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
  		} else {
  			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
  		}
  	});
  	return destination
  }

  function deepmerge(target, source, options) {
  	options = options || {};
  	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  	// implementations can use it. The caller may not replace it.
  	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  	var sourceIsArray = Array.isArray(source);
  	var targetIsArray = Array.isArray(target);
  	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  	if (!sourceAndTargetTypesMatch) {
  		return cloneUnlessOtherwiseSpecified(source, options)
  	} else if (sourceIsArray) {
  		return options.arrayMerge(target, source, options)
  	} else {
  		return mergeObject(target, source, options)
  	}
  }

  deepmerge.all = function deepmergeAll(array, options) {
  	if (!Array.isArray(array)) {
  		throw new Error('first argument should be an array')
  	}

  	return array.reduce(function(prev, next) {
  		return deepmerge(prev, next, options)
  	}, {})
  };

  var deepmerge_1 = deepmerge;

  var cjs = deepmerge_1;

  var lib = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getObjectType = function (value) {
      return Object.prototype.toString.call(value).slice(8, -1);
  };
  var isObjectOfType = function (type) { return function (value) {
      return exports.getObjectType(value) === type;
  }; };
  var isOfType = function (type) { return function (value) { return typeof value === type; }; };
  var is = function (value) {
      switch (value) {
          case null:
              return "null" /* null */;
          case true:
          case false:
              return "boolean" /* boolean */;
      }
      switch (typeof value) {
          case 'undefined':
              return "undefined" /* undefined */;
          case 'string':
              return "string" /* string */;
          case 'number':
              return "number" /* number */;
          case 'bigint':
              return "bigint" /* bigint */;
          case 'symbol':
              return "symbol" /* symbol */;
      }
      if (is.array(value)) {
          return "Array" /* array */;
      }
      if (is.function(value)) {
          return "Function" /* function */;
      }
      var tagType = exports.getObjectType(value);
      /* istanbul ignore else */
      if (tagType) {
          return tagType;
      }
      /* istanbul ignore next */
      return "Object" /* object */;
  };
  is.array = Array.isArray;
  is.arrayOf = function (target, predicate) {
      if (!is.array(target) && !is.function(predicate)) {
          return false;
      }
      return target.every(function (d) { return predicate(d); });
  };
  // tslint:disable-next-line:ban-types
  is.asyncFunction = isObjectOfType("AsyncFunction" /* asyncFunction */);
  is.boolean = function (value) {
      return value === true || value === false;
  };
  is.date = isObjectOfType("Date" /* date */);
  is.defined = function (value) { return !is.undefined(value); };
  is.domElement = function (value) {
      var DOM_PROPERTIES_TO_CHECK = [
          'innerHTML',
          'ownerDocument',
          'style',
          'attributes',
          'nodeValue',
      ];
      return (is.object(value) &&
          !is.plainObject(value) &&
          value.nodeType === 1 &&
          is.string(value.nodeName) &&
          DOM_PROPERTIES_TO_CHECK.every(function (property) { return property in value; }));
  };
  is.empty = function (value) {
      return ((is.string(value) && value.length === 0) ||
          (is.array(value) && value.length === 0) ||
          (is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length === 0) ||
          (is.set(value) && value.size === 0) ||
          (is.map(value) && value.size === 0));
  };
  is.error = isObjectOfType("Error" /* error */);
  // tslint:disable-next-line:ban-types
  is.function = isObjectOfType("Function" /* function */);
  is.generator = function (value) {
      return (is.iterable(value) &&
          is.function(value.next) &&
          is.function(value.throw));
  };
  is.generatorFunction = isObjectOfType("GeneratorFunction" /* generatorFunction */);
  // tslint:disable-next-line:variable-name
  is.instanceOf = function (instance, class_) {
      if (!instance || !class_) {
          return false;
      }
      return Object.getPrototypeOf(instance) === class_.prototype;
  };
  is.iterable = function (value) {
      return (!is.nullOrUndefined(value) && is.function(value[Symbol.iterator]));
  };
  is.map = isObjectOfType("Map" /* map */);
  is.nan = function (value) {
      return Number.isNaN(value);
  };
  is.null = function (value) {
      return value === null;
  };
  is.nullOrUndefined = function (value) {
      return is.null(value) || is.undefined(value);
  };
  is.number = function (value) {
      return isOfType("number" /* number */)(value) && !is.nan(value);
  };
  is.numericString = function (value) {
      return is.string(value) && value.length > 0 && !Number.isNaN(Number(value));
  };
  is.object = function (value) {
      return !is.nullOrUndefined(value) && (is.function(value) || typeof value === 'object');
  };
  is.oneOf = function (target, value) {
      if (!is.array(target)) {
          return false;
      }
      return target.indexOf(value) > -1;
  };
  is.plainObject = function (value) {
      if (exports.getObjectType(value) !== 'Object') {
          return false;
      }
      var prototype = Object.getPrototypeOf(value);
      return prototype === null || prototype === Object.getPrototypeOf({});
  };
  is.promise = isObjectOfType("Promise" /* promise */);
  is.propertyOf = function (target, key, predicate) {
      if (!is.object(target) || !key) {
          return false;
      }
      // @ts-ignore
      var value = target[key];
      if (is.function(predicate)) {
          return predicate(value);
      }
      return is.defined(value);
  };
  is.regexp = isObjectOfType("RegExp" /* regExp */);
  is.set = isObjectOfType("Set" /* set */);
  is.string = isOfType("string" /* string */);
  is.symbol = isOfType("symbol" /* symbol */);
  is.undefined = isOfType("undefined" /* undefined */);
  is.weakMap = isObjectOfType("WeakMap" /* weakMap */);
  is.weakSet = isObjectOfType("WeakSet" /* weakSet */);
  exports.default = is;

  });

  var is = unwrapExports(lib);
  var lib_1 = lib.getObjectType;

  var deepDiff = createCommonjsModule(function (module, exports) {
  (function(root, factory) { // eslint-disable-line no-extra-semi
    var deepDiff = factory(root);
    // eslint-disable-next-line no-undef
    {
        // Node.js or ReactNative
        module.exports = deepDiff;
    }
  }(commonjsGlobal, function(root) {
    var validKinds = ['N', 'E', 'A', 'D'];

    // nodejs compatible on server side and in the browser.
    function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }

    function Diff(kind, path) {
      Object.defineProperty(this, 'kind', {
        value: kind,
        enumerable: true
      });
      if (path && path.length) {
        Object.defineProperty(this, 'path', {
          value: path,
          enumerable: true
        });
      }
    }

    function DiffEdit(path, origin, value) {
      DiffEdit.super_.call(this, 'E', path);
      Object.defineProperty(this, 'lhs', {
        value: origin,
        enumerable: true
      });
      Object.defineProperty(this, 'rhs', {
        value: value,
        enumerable: true
      });
    }
    inherits(DiffEdit, Diff);

    function DiffNew(path, value) {
      DiffNew.super_.call(this, 'N', path);
      Object.defineProperty(this, 'rhs', {
        value: value,
        enumerable: true
      });
    }
    inherits(DiffNew, Diff);

    function DiffDeleted(path, value) {
      DiffDeleted.super_.call(this, 'D', path);
      Object.defineProperty(this, 'lhs', {
        value: value,
        enumerable: true
      });
    }
    inherits(DiffDeleted, Diff);

    function DiffArray(path, index, item) {
      DiffArray.super_.call(this, 'A', path);
      Object.defineProperty(this, 'index', {
        value: index,
        enumerable: true
      });
      Object.defineProperty(this, 'item', {
        value: item,
        enumerable: true
      });
    }
    inherits(DiffArray, Diff);

    function arrayRemove(arr, from, to) {
      var rest = arr.slice((to || from) + 1 || arr.length);
      arr.length = from < 0 ? arr.length + from : from;
      arr.push.apply(arr, rest);
      return arr;
    }

    function realTypeOf(subject) {
      var type = typeof subject;
      if (type !== 'object') {
        return type;
      }

      if (subject === Math) {
        return 'math';
      } else if (subject === null) {
        return 'null';
      } else if (Array.isArray(subject)) {
        return 'array';
      } else if (Object.prototype.toString.call(subject) === '[object Date]') {
        return 'date';
      } else if (typeof subject.toString === 'function' && /^\/.*\//.test(subject.toString())) {
        return 'regexp';
      }
      return 'object';
    }

    // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    function hashThisString(string) {
      var hash = 0;
      if (string.length === 0) { return hash; }
      for (var i = 0; i < string.length; i++) {
        var char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    }

    // Gets a hash of the given object in an array order-independent fashion
    // also object key order independent (easier since they can be alphabetized)
    function getOrderIndependentHash(object) {
      var accum = 0;
      var type = realTypeOf(object);

      if (type === 'array') {
        object.forEach(function (item) {
          // Addition is commutative so this is order indep
          accum += getOrderIndependentHash(item);
        });

        var arrayString = '[type: array, hash: ' + accum + ']';
        return accum + hashThisString(arrayString);
      }

      if (type === 'object') {
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            var keyValueString = '[ type: object, key: ' + key + ', value hash: ' + getOrderIndependentHash(object[key]) + ']';
            accum += hashThisString(keyValueString);
          }
        }

        return accum;
      }

      // Non object, non array...should be good?
      var stringToHash = '[ type: ' + type + ' ; value: ' + object + ']';
      return accum + hashThisString(stringToHash);
    }

    function deepDiff(lhs, rhs, changes, prefilter, path, key, stack, orderIndependent) {
      changes = changes || [];
      path = path || [];
      stack = stack || [];
      var currentPath = path.slice(0);
      if (typeof key !== 'undefined' && key !== null) {
        if (prefilter) {
          if (typeof (prefilter) === 'function' && prefilter(currentPath, key)) {
            return;
          } else if (typeof (prefilter) === 'object') {
            if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) {
              return;
            }
            if (prefilter.normalize) {
              var alt = prefilter.normalize(currentPath, key, lhs, rhs);
              if (alt) {
                lhs = alt[0];
                rhs = alt[1];
              }
            }
          }
        }
        currentPath.push(key);
      }

      // Use string comparison for regexes
      if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
        lhs = lhs.toString();
        rhs = rhs.toString();
      }

      var ltype = typeof lhs;
      var rtype = typeof rhs;
      var i, j, k, other;

      var ldefined = ltype !== 'undefined' ||
        (stack && (stack.length > 0) && stack[stack.length - 1].lhs &&
          Object.getOwnPropertyDescriptor(stack[stack.length - 1].lhs, key));
      var rdefined = rtype !== 'undefined' ||
        (stack && (stack.length > 0) && stack[stack.length - 1].rhs &&
          Object.getOwnPropertyDescriptor(stack[stack.length - 1].rhs, key));

      if (!ldefined && rdefined) {
        changes.push(new DiffNew(currentPath, rhs));
      } else if (!rdefined && ldefined) {
        changes.push(new DiffDeleted(currentPath, lhs));
      } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
        changes.push(new DiffEdit(currentPath, lhs, rhs));
      } else if (realTypeOf(lhs) === 'date' && (lhs - rhs) !== 0) {
        changes.push(new DiffEdit(currentPath, lhs, rhs));
      } else if (ltype === 'object' && lhs !== null && rhs !== null) {
        for (i = stack.length - 1; i > -1; --i) {
          if (stack[i].lhs === lhs) {
            other = true;
            break;
          }
        }
        if (!other) {
          stack.push({ lhs: lhs, rhs: rhs });
          if (Array.isArray(lhs)) {
            // If order doesn't matter, we need to sort our arrays
            if (orderIndependent) {
              lhs.sort(function (a, b) {
                return getOrderIndependentHash(a) - getOrderIndependentHash(b);
              });

              rhs.sort(function (a, b) {
                return getOrderIndependentHash(a) - getOrderIndependentHash(b);
              });
            }
            i = rhs.length - 1;
            j = lhs.length - 1;
            while (i > j) {
              changes.push(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i--])));
            }
            while (j > i) {
              changes.push(new DiffArray(currentPath, j, new DiffDeleted(undefined, lhs[j--])));
            }
            for (; i >= 0; --i) {
              deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack, orderIndependent);
            }
          } else {
            var akeys = Object.keys(lhs);
            var pkeys = Object.keys(rhs);
            for (i = 0; i < akeys.length; ++i) {
              k = akeys[i];
              other = pkeys.indexOf(k);
              if (other >= 0) {
                deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);
                pkeys[other] = null;
              } else {
                deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack, orderIndependent);
              }
            }
            for (i = 0; i < pkeys.length; ++i) {
              k = pkeys[i];
              if (k) {
                deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);
              }
            }
          }
          stack.length = stack.length - 1;
        } else if (lhs !== rhs) {
          // lhs is contains a cycle at this element and it differs from rhs
          changes.push(new DiffEdit(currentPath, lhs, rhs));
        }
      } else if (lhs !== rhs) {
        if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
          changes.push(new DiffEdit(currentPath, lhs, rhs));
        }
      }
    }

    function observableDiff(lhs, rhs, observer, prefilter, orderIndependent) {
      var changes = [];
      deepDiff(lhs, rhs, changes, prefilter, null, null, null, orderIndependent);
      if (observer) {
        for (var i = 0; i < changes.length; ++i) {
          observer(changes[i]);
        }
      }
      return changes;
    }

    function orderIndependentDeepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
      return deepDiff(lhs, rhs, changes, prefilter, path, key, stack, true);
    }

    function accumulateDiff(lhs, rhs, prefilter, accum) {
      var observer = (accum) ?
        function (difference) {
          if (difference) {
            accum.push(difference);
          }
        } : undefined;
      var changes = observableDiff(lhs, rhs, observer, prefilter);
      return (accum) ? accum : (changes.length) ? changes : undefined;
    }

    function accumulateOrderIndependentDiff(lhs, rhs, prefilter, accum) {
      var observer = (accum) ?
        function (difference) {
          if (difference) {
            accum.push(difference);
          }
        } : undefined;
      var changes = observableDiff(lhs, rhs, observer, prefilter, true);
      return (accum) ? accum : (changes.length) ? changes : undefined;
    }

    function applyArrayChange(arr, index, change) {
      if (change.path && change.path.length) {
        var it = arr[index],
          i, u = change.path.length - 1;
        for (i = 0; i < u; i++) {
          it = it[change.path[i]];
        }
        switch (change.kind) {
          case 'A':
            applyArrayChange(it[change.path[i]], change.index, change.item);
            break;
          case 'D':
            delete it[change.path[i]];
            break;
          case 'E':
          case 'N':
            it[change.path[i]] = change.rhs;
            break;
        }
      } else {
        switch (change.kind) {
          case 'A':
            applyArrayChange(arr[index], change.index, change.item);
            break;
          case 'D':
            arr = arrayRemove(arr, index);
            break;
          case 'E':
          case 'N':
            arr[index] = change.rhs;
            break;
        }
      }
      return arr;
    }

    function applyChange(target, source, change) {
      if (typeof change === 'undefined' && source && ~validKinds.indexOf(source.kind)) {
        change = source;
      }
      if (target && change && change.kind) {
        var it = target,
          i = -1,
          last = change.path ? change.path.length - 1 : 0;
        while (++i < last) {
          if (typeof it[change.path[i]] === 'undefined') {
            it[change.path[i]] = (typeof change.path[i + 1] !== 'undefined' && typeof change.path[i + 1] === 'number') ? [] : {};
          }
          it = it[change.path[i]];
        }
        switch (change.kind) {
          case 'A':
            if (change.path && typeof it[change.path[i]] === 'undefined') {
              it[change.path[i]] = [];
            }
            applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
            break;
          case 'D':
            delete it[change.path[i]];
            break;
          case 'E':
          case 'N':
            it[change.path[i]] = change.rhs;
            break;
        }
      }
    }

    function revertArrayChange(arr, index, change) {
      if (change.path && change.path.length) {
        // the structure of the object at the index has changed...
        var it = arr[index],
          i, u = change.path.length - 1;
        for (i = 0; i < u; i++) {
          it = it[change.path[i]];
        }
        switch (change.kind) {
          case 'A':
            revertArrayChange(it[change.path[i]], change.index, change.item);
            break;
          case 'D':
            it[change.path[i]] = change.lhs;
            break;
          case 'E':
            it[change.path[i]] = change.lhs;
            break;
          case 'N':
            delete it[change.path[i]];
            break;
        }
      } else {
        // the array item is different...
        switch (change.kind) {
          case 'A':
            revertArrayChange(arr[index], change.index, change.item);
            break;
          case 'D':
            arr[index] = change.lhs;
            break;
          case 'E':
            arr[index] = change.lhs;
            break;
          case 'N':
            arr = arrayRemove(arr, index);
            break;
        }
      }
      return arr;
    }

    function revertChange(target, source, change) {
      if (target && source && change && change.kind) {
        var it = target,
          i, u;
        u = change.path.length - 1;
        for (i = 0; i < u; i++) {
          if (typeof it[change.path[i]] === 'undefined') {
            it[change.path[i]] = {};
          }
          it = it[change.path[i]];
        }
        switch (change.kind) {
          case 'A':
            // Array was modified...
            // it will be an array...
            revertArrayChange(it[change.path[i]], change.index, change.item);
            break;
          case 'D':
            // Item was deleted...
            it[change.path[i]] = change.lhs;
            break;
          case 'E':
            // Item was edited...
            it[change.path[i]] = change.lhs;
            break;
          case 'N':
            // Item is new...
            delete it[change.path[i]];
            break;
        }
      }
    }

    function applyDiff(target, source, filter) {
      if (target && source) {
        var onChange = function (change) {
          if (!filter || filter(target, source, change)) {
            applyChange(target, source, change);
          }
        };
        observableDiff(target, source, onChange);
      }
    }

    Object.defineProperties(accumulateDiff, {

      diff: {
        value: accumulateDiff,
        enumerable: true
      },
      orderIndependentDiff: {
        value: accumulateOrderIndependentDiff,
        enumerable: true
      },
      observableDiff: {
        value: observableDiff,
        enumerable: true
      },
      orderIndependentObservableDiff: {
        value: orderIndependentDeepDiff,
        enumerable: true
      },
      orderIndepHash: {
        value: getOrderIndependentHash,
        enumerable: true
      },
      applyDiff: {
        value: applyDiff,
        enumerable: true
      },
      applyChange: {
        value: applyChange,
        enumerable: true
      },
      revertChange: {
        value: revertChange,
        enumerable: true
      },
      isConflict: {
        value: function () {
          return typeof $conflict !== 'undefined';
        },
        enumerable: true
      }
    });

    // hackish...
    accumulateDiff.DeepDiff = accumulateDiff;
    // ...but works with:
    // import DeepDiff from 'deep-diff'
    // import { DeepDiff } from 'deep-diff'
    // const DeepDiff = require('deep-diff');
    // const { DeepDiff } = require('deep-diff');

    if (root) {
      root.DeepDiff = accumulateDiff;
    }

    return accumulateDiff;
  }));
  });

  /**
  * @license nested-property https://github.com/cosmosio/nested-property
  *
  * The MIT License (MIT)
  *
  * Copyright (c) 2014-2015 Olivier Scherrer <pode.fr@gmail.com>
  */

  var nestedProperty = {
    set: setNestedProperty,
    get: getNestedProperty,
    has: hasNestedProperty,
    hasOwn: function (object, property, options) {
        return this.has(object, property, options || {own: true});
    },
    isIn: isInNestedProperty
  };

  /**
   * Get the property of an object nested in one or more objects
   * given an object such as a.b.c.d = 5, getNestedProperty(a, "b.c.d") will return 5.
   * @param {Object} object the object to get the property from
   * @param {String} property the path to the property as a string
   * @returns the object or the the property value if found
   */
  function getNestedProperty(object, property) {
      if (object && typeof object == "object") {
          if (typeof property == "string" && property !== "") {
              var split = property.split(".");
              return split.reduce(function (obj, prop) {
                  return obj && obj[prop];
              }, object);
          } else if (typeof property == "number") {
              return object[property];
          } else {
              return object;
          }
      } else {
          return object;
      }
  }

  /**
   * Tell if a nested object has a given property (or array a given index)
   * given an object such as a.b.c.d = 5, hasNestedProperty(a, "b.c.d") will return true.
   * It also returns true if the property is in the prototype chain.
   * @param {Object} object the object to get the property from
   * @param {String} property the path to the property as a string
   * @param {Object} options:
   *  - own: set to reject properties from the prototype
   * @returns true if has (property in object), false otherwise
   */
  function hasNestedProperty(object, property, options) {
      options = options || {};

      if (object && typeof object == "object") {
          if (typeof property == "string" && property !== "") {
              var split = property.split(".");
              return split.reduce(function (obj, prop, idx, array) {
                  if (idx == array.length - 1) {
                      if (options.own) {
                          return !!(obj && obj.hasOwnProperty(prop));
                      } else {
                          return !!(obj !== null && typeof obj == "object" && prop in obj);
                      }
                  }
                  return obj && obj[prop];
              }, object);
          } else if (typeof property == "number") {
              return property in object;
          } else {
              return false;
          }
      } else {
          return false;
      }
  }

  /**
   * Set the property of an object nested in one or more objects
   * If the property doesn't exist, it gets created.
   * @param {Object} object
   * @param {String} property
   * @param value the value to set
   * @returns object if no assignment was made or the value if the assignment was made
   */
  function setNestedProperty(object, property, value) {
      if (object && typeof object == "object") {
          if (typeof property == "string" && property !== "") {
              var split = property.split(".");
              return split.reduce(function (obj, prop, idx) {
                  const nextPropIsNumber = Number.isInteger(Number(split[idx + 1]));
                  
                  obj[prop] = obj[prop] || (nextPropIsNumber ? [] : {});
                  if (split.length == (idx + 1)) {
                      obj[prop] = value;
                  }
                  return obj[prop];
              }, object);
          } else if (typeof property == "number") {
              object[property] = value;
              return object[property];
          } else {
              return object;
          }
      } else {
          return object;
      }
  }

  /**
   * Tell if an object is on the path to a nested property
   * If the object is on the path, and the path exists, it returns true, and false otherwise.
   * @param {Object} object to get the nested property from
   * @param {String} property name of the nested property
   * @param {Object} objectInPath the object to check
   * @param {Object} options:
   *  - validPath: return false if the path is invalid, even if the object is in the path
   * @returns {boolean} true if the object is on the path
   */
  function isInNestedProperty(object, property, objectInPath, options) {
      options = options || {};

      if (object && typeof object == "object") {
          if (typeof property == "string" && property !== "") {
              var split = property.split("."),
                  isIn = false,
                  pathExists;

              pathExists = !!split.reduce(function (obj, prop) {
                  isIn = isIn || obj === objectInPath || (!!obj && obj[prop] === objectInPath);
                  return obj && obj[prop];
              }, object);

              if (options.validPath) {
                  return isIn && pathExists;
              } else {
                  return isIn;
              }
          } else {
              return false;
          }
      } else {
          return false;
      }
  }

  var lib$1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });

  // @ts-ignore

  function isPlainObj() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      return args.every(function (d) {
          if (!d) {
              return false;
          }
          var prototype = Object.getPrototypeOf(d);
          return (Object.prototype.toString.call(d).slice(8, -1) === 'Object' &&
              (prototype === null || prototype === Object.getPrototypeOf({})));
      });
  }
  function isArray() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      return args.every(Array.isArray);
  }
  function isNumber() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      return args.every(function (d) { return typeof d === 'number'; });
  }
  function treeChanges(data, nextData) {
      if (!data || !nextData) {
          throw new Error('Missing required parameters');
      }
      return {
          changed: function (key) {
              var left = nestedProperty.get(data, key);
              var right = nestedProperty.get(nextData, key);
              if (isArray(left, right) || isPlainObj(left, right)) {
                  return !!deepDiff.diff(left, right);
              }
              return left !== right;
          },
          changedFrom: function (key, previous, actual) {
              if (typeof key === 'undefined') {
                  throw new Error('Key parameter is required');
              }
              var useActual = typeof previous !== 'undefined' && typeof actual !== 'undefined';
              var left = nestedProperty.get(data, key);
              var right = nestedProperty.get(nextData, key);
              var leftComparator = Array.isArray(previous)
                  ? previous.indexOf(left) >= 0
                  : left === previous;
              var rightComparator = Array.isArray(actual) ? actual.indexOf(right) >= 0 : right === actual;
              return leftComparator && (useActual ? rightComparator : !useActual);
          },
          changedTo: function (key, actual) {
              if (typeof key === 'undefined') {
                  throw new Error('Key parameter is required');
              }
              var left = nestedProperty.get(data, key);
              var right = nestedProperty.get(nextData, key);
              var leftComparator = Array.isArray(actual) ? actual.indexOf(left) < 0 : left !== actual;
              var rightComparator = Array.isArray(actual) ? actual.indexOf(right) >= 0 : right === actual;
              return leftComparator && rightComparator;
          },
          increased: function (key) {
              if (typeof key === 'undefined') {
                  throw new Error('Key parameter is required');
              }
              return (isNumber(nestedProperty.get(data, key), nestedProperty.get(nextData, key)) &&
                  nestedProperty.get(data, key) < nestedProperty.get(nextData, key));
          },
          decreased: function (key) {
              if (typeof key === 'undefined') {
                  throw new Error('Key parameter is required');
              }
              return (isNumber(nestedProperty.get(data, key), nestedProperty.get(nextData, key)) &&
                  nestedProperty.get(data, key) > nestedProperty.get(nextData, key));
          },
      };
  }
  exports.default = treeChanges;

  });

  var treeChanges = unwrapExports(lib$1);

  var DEFAULTS = {flip:{padding:20},preventOverflow:{padding:10}};

  var STATUS = {INIT:'init',IDLE:'idle',OPENING:'opening',OPEN:'open',CLOSING:'closing',ERROR:'error'};

  var exenv = createCommonjsModule(function (module) {
  /*!
    Copyright (c) 2015 Jed Watson.
    Based on code that is Copyright 2013-2015, Facebook, Inc.
    All rights reserved.
  */
  /* global define */

  (function () {

  	var canUseDOM = !!(
  		typeof window !== 'undefined' &&
  		window.document &&
  		window.document.createElement
  	);

  	var ExecutionEnvironment = {

  		canUseDOM: canUseDOM,

  		canUseWorkers: typeof Worker !== 'undefined',

  		canUseEventListeners:
  			canUseDOM && !!(window.addEventListener || window.attachEvent),

  		canUseViewport: canUseDOM && !!window.screen

  	};

  	if ( module.exports) {
  		module.exports = ExecutionEnvironment;
  	} else {
  		window.ExecutionEnvironment = ExecutionEnvironment;
  	}

  }());
  });

  var canUseDOM=exenv.canUseDOM;var isReact16=ReactDOM.createPortal!==undefined;function isMobile(){return 'ontouchstart'in window&&/Mobi/.test(navigator.userAgent);}/**
   * Log method calls if debug is enabled
   *
   * @private
   * @param {Object}       arg
   * @param {string}       arg.title    - The title the logger was called from
   * @param {Object|Array} [arg.data]   - The data to be logged
   * @param {boolean}      [arg.warn]  - If true, the message will be a warning
   * @param {boolean}      [arg.debug] - Nothing will be logged unless debug is true
   */function log(_ref){var title=_ref.title,data=_ref.data,_ref$warn=_ref.warn,warn=_ref$warn===void 0?false:_ref$warn,_ref$debug=_ref.debug,debug=_ref$debug===void 0?false:_ref$debug;/* eslint-disable no-console */var logFn=warn?console.warn||console.error:console.log;if(debug&&title&&data){console.groupCollapsed("%creact-floater: ".concat(title),'color: #9b00ff; font-weight: bold; font-size: 12px;');if(Array.isArray(data)){data.forEach(function(d){if(is.plainObject(d)&&d.key){logFn.apply(console,[d.key,d.value]);}else{logFn.apply(console,[d]);}});}else{logFn.apply(console,[data]);}console.groupEnd();}/* eslint-enable */}function on(element,event,cb){var capture=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;element.addEventListener(event,cb,capture);}function off(element,event,cb){var capture=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;element.removeEventListener(event,cb,capture);}function once(element,event,cb){var capture=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;var _nextCB;// eslint-disable-next-line prefer-const
  _nextCB=function nextCB(e){cb(e);off(element,event,_nextCB);};on(element,event,_nextCB,capture);}function noop(){}

  var ReactFloaterPortal=/*#__PURE__*/function(_React$Component){_inherits(ReactFloaterPortal,_React$Component);function ReactFloaterPortal(props){var _this;_classCallCheck(this,ReactFloaterPortal);_this=_possibleConstructorReturn(this,_getPrototypeOf(ReactFloaterPortal).call(this,props));if(!canUseDOM)return _possibleConstructorReturn(_this);_this.node=document.createElement('div');if(props.id){_this.node.id=props.id;}if(props.zIndex){_this.node.style.zIndex=props.zIndex;}document.body.appendChild(_this.node);return _this;}_createClass(ReactFloaterPortal,[{key:"componentDidMount",value:function componentDidMount(){if(!canUseDOM)return;if(!isReact16){this.renderPortal();}}},{key:"componentDidUpdate",value:function componentDidUpdate(){if(!canUseDOM)return;if(!isReact16){this.renderPortal();}}},{key:"componentWillUnmount",value:function componentWillUnmount(){if(!canUseDOM||!this.node)return;if(!isReact16){ReactDOM.unmountComponentAtNode(this.node);}document.body.removeChild(this.node);}},{key:"renderPortal",value:function renderPortal(){if(!canUseDOM)return null;var _this$props=this.props,children=_this$props.children,setRef=_this$props.setRef;/* istanbul ignore else */if(isReact16){return ReactDOM.createPortal(children,this.node);}var portal=ReactDOM.unstable_renderSubtreeIntoContainer(this,children.length>1?React.createElement("div",null,children):children[0],this.node);setRef(portal);return null;}},{key:"renderReact16",value:function renderReact16(){var _this$props2=this.props,hasChildren=_this$props2.hasChildren,placement=_this$props2.placement,target=_this$props2.target;if(!hasChildren){if(target||placement==='center'){return this.renderPortal();}return null;}return this.renderPortal();}},{key:"render",value:function render(){if(!isReact16){return null;}return this.renderReact16();}}]);return ReactFloaterPortal;}(React.Component);_defineProperty(ReactFloaterPortal,"propTypes",{children:PropTypes.oneOfType([PropTypes.element,PropTypes.array]),hasChildren:PropTypes.bool,id:PropTypes.oneOfType([PropTypes.string,PropTypes.number]),placement:PropTypes.string,setRef:PropTypes.func.isRequired,target:PropTypes.oneOfType([PropTypes.object,PropTypes.string]),zIndex:PropTypes.number});

  var FloaterArrow=/*#__PURE__*/function(_React$Component){_inherits(FloaterArrow,_React$Component);function FloaterArrow(){_classCallCheck(this,FloaterArrow);return _possibleConstructorReturn(this,_getPrototypeOf(FloaterArrow).apply(this,arguments));}_createClass(FloaterArrow,[{key:"render",value:function render(){var _this$props=this.props,placement=_this$props.placement,setArrowRef=_this$props.setArrowRef,styles=_this$props.styles;var _styles$arrow=styles.arrow,color=_styles$arrow.color,display=_styles$arrow.display,length=_styles$arrow.length,margin=_styles$arrow.margin,position=_styles$arrow.position,spread=_styles$arrow.spread;var arrowStyles={display:display,position:position};var points;var x=spread;var y=length;/* istanbul ignore else */if(placement.startsWith('top')){points="0,0 ".concat(x/2,",").concat(y," ").concat(x,",0");arrowStyles.bottom=0;arrowStyles.marginLeft=margin;arrowStyles.marginRight=margin;}else if(placement.startsWith('bottom')){points="".concat(x,",").concat(y," ").concat(x/2,",0 0,").concat(y);arrowStyles.top=0;arrowStyles.marginLeft=margin;arrowStyles.marginRight=margin;}else if(placement.startsWith('left')){y=spread;x=length;points="0,0 ".concat(x,",").concat(y/2," 0,").concat(y);arrowStyles.right=0;arrowStyles.marginTop=margin;arrowStyles.marginBottom=margin;}else if(placement.startsWith('right')){y=spread;x=length;points="".concat(x,",").concat(y," ").concat(x,",0 0,").concat(y/2);arrowStyles.left=0;arrowStyles.marginTop=margin;arrowStyles.marginBottom=margin;}return React.createElement("div",{className:"__floater__arrow",style:this.parentStyle},React.createElement("span",{ref:setArrowRef,style:arrowStyles},React.createElement("svg",{width:x,height:y,version:"1.1",xmlns:"http://www.w3.org/2000/svg"},React.createElement("polygon",{points:points,fill:color}))));}},{key:"parentStyle",get:function get(){var _this$props2=this.props,placement=_this$props2.placement,styles=_this$props2.styles;var length=styles.arrow.length;var arrow={pointerEvents:'none',position:'absolute',width:'100%'};/* istanbul ignore else */if(placement.startsWith('top')){arrow.bottom=0;arrow.left=0;arrow.right=0;arrow.height=length;}else if(placement.startsWith('bottom')){arrow.left=0;arrow.right=0;arrow.top=0;arrow.height=length;}else if(placement.startsWith('left')){arrow.right=0;arrow.top=0;arrow.bottom=0;}else if(placement.startsWith('right')){arrow.left=0;arrow.top=0;}return arrow;}}]);return FloaterArrow;}(React.Component);_defineProperty(FloaterArrow,"propTypes",{placement:PropTypes.string.isRequired,setArrowRef:PropTypes.func.isRequired,styles:PropTypes.object.isRequired});

  var FloaterCloseBtn=function FloaterCloseBtn(_ref){var handleClick=_ref.handleClick,styles=_ref.styles;var color=styles.color,height=styles.height,width=styles.width,style=_objectWithoutProperties(styles,["color","height","width"]);return React.createElement("button",{"aria-label":"close",onClick:handleClick,style:style,type:"button"},React.createElement("svg",{width:"".concat(width,"px"),height:"".concat(height,"px"),viewBox:"0 0 18 18",version:"1.1",xmlns:"http://www.w3.org/2000/svg",preserveAspectRatio:"xMidYMid"},React.createElement("g",null,React.createElement("path",{d:"M8.13911129,9.00268191 L0.171521827,17.0258467 C-0.0498027049,17.248715 -0.0498027049,17.6098394 0.171521827,17.8327545 C0.28204354,17.9443526 0.427188206,17.9998706 0.572051765,17.9998706 C0.71714958,17.9998706 0.862013139,17.9443526 0.972581703,17.8327545 L9.0000937,9.74924618 L17.0276057,17.8327545 C17.1384085,17.9443526 17.2832721,17.9998706 17.4281356,17.9998706 C17.5729992,17.9998706 17.718097,17.9443526 17.8286656,17.8327545 C18.0499901,17.6098862 18.0499901,17.2487618 17.8286656,17.0258467 L9.86135722,9.00268191 L17.8340066,0.973848225 C18.0553311,0.750979934 18.0553311,0.389855532 17.8340066,0.16694039 C17.6126821,-0.0556467968 17.254037,-0.0556467968 17.0329467,0.16694039 L9.00042166,8.25611765 L0.967006424,0.167268345 C0.745681892,-0.0553188426 0.387317931,-0.0553188426 0.165993399,0.167268345 C-0.0553311331,0.390136635 -0.0553311331,0.751261038 0.165993399,0.974176179 L8.13920499,9.00268191 L8.13911129,9.00268191 Z",fill:color}))));};FloaterCloseBtn.propTypes={handleClick:PropTypes.func.isRequired,styles:PropTypes.object.isRequired};

  var FloaterContainer=function FloaterContainer(_ref){var content=_ref.content,footer=_ref.footer,handleClick=_ref.handleClick,open=_ref.open,positionWrapper=_ref.positionWrapper,showCloseButton=_ref.showCloseButton,title=_ref.title,styles=_ref.styles;var output={content:React.isValidElement(content)?content:React.createElement("div",{className:"__floater__content",style:styles.content},content)};if(title){output.title=React.isValidElement(title)?title:React.createElement("div",{className:"__floater__title",style:styles.title},title);}if(footer){output.footer=React.isValidElement(footer)?footer:React.createElement("div",{className:"__floater__footer",style:styles.footer},footer);}if((showCloseButton||positionWrapper)&&!is["boolean"](open)){output.close=React.createElement(FloaterCloseBtn,{styles:styles.close,handleClick:handleClick});}return React.createElement("div",{className:"__floater__container",style:styles.container},output.close,output.title,output.content,output.footer);};FloaterContainer.propTypes={content:PropTypes.node.isRequired,footer:PropTypes.node,handleClick:PropTypes.func.isRequired,open:PropTypes.bool,positionWrapper:PropTypes.bool.isRequired,showCloseButton:PropTypes.bool.isRequired,styles:PropTypes.object.isRequired,title:PropTypes.node};

  var Floater=/*#__PURE__*/function(_React$Component){_inherits(Floater,_React$Component);function Floater(){_classCallCheck(this,Floater);return _possibleConstructorReturn(this,_getPrototypeOf(Floater).apply(this,arguments));}_createClass(Floater,[{key:"render",value:function render(){var _this$props=this.props,component=_this$props.component,closeFn=_this$props.handleClick,hideArrow=_this$props.hideArrow,setFloaterRef=_this$props.setFloaterRef,status=_this$props.status;var output={};var classes=['__floater'];if(component){if(React.isValidElement(component)){output.content=React.cloneElement(component,{closeFn:closeFn});}else{output.content=component({closeFn:closeFn});}}else{output.content=React.createElement(FloaterContainer,this.props);}if(status===STATUS.OPEN){classes.push('__floater__open');}if(!hideArrow){output.arrow=React.createElement(FloaterArrow,this.props);}return React.createElement("div",{ref:setFloaterRef,className:classes.join(' '),style:this.style},React.createElement("div",{className:"__floater__body"},output.content,output.arrow));}},{key:"style",get:function get(){var _this$props2=this.props,disableAnimation=_this$props2.disableAnimation,component=_this$props2.component,placement=_this$props2.placement,hideArrow=_this$props2.hideArrow,status=_this$props2.status,styles=_this$props2.styles;var length=styles.arrow.length,floater=styles.floater,floaterCentered=styles.floaterCentered,floaterClosing=styles.floaterClosing,floaterOpening=styles.floaterOpening,floaterWithAnimation=styles.floaterWithAnimation,floaterWithComponent=styles.floaterWithComponent;var element={};if(!hideArrow){if(placement.startsWith('top')){element.padding="0 0 ".concat(length,"px");}else if(placement.startsWith('bottom')){element.padding="".concat(length,"px 0 0");}else if(placement.startsWith('left')){element.padding="0 ".concat(length,"px 0 0");}else if(placement.startsWith('right')){element.padding="0 0 0 ".concat(length,"px");}}if([STATUS.OPENING,STATUS.OPEN].indexOf(status)!==-1){element=_objectSpread2({},element,{},floaterOpening);}if(status===STATUS.CLOSING){element=_objectSpread2({},element,{},floaterClosing);}if(status===STATUS.OPEN&&!disableAnimation){element=_objectSpread2({},element,{},floaterWithAnimation);}if(placement==='center'){element=_objectSpread2({},element,{},floaterCentered);}if(component){element=_objectSpread2({},element,{},floaterWithComponent);}return _objectSpread2({},floater,{},element);}}]);return Floater;}(React.Component);_defineProperty(Floater,"propTypes",{component:PropTypes.oneOfType([PropTypes.func,PropTypes.element]),content:PropTypes.node,disableAnimation:PropTypes.bool.isRequired,footer:PropTypes.node,handleClick:PropTypes.func.isRequired,hideArrow:PropTypes.bool.isRequired,open:PropTypes.bool,placement:PropTypes.string.isRequired,positionWrapper:PropTypes.bool.isRequired,setArrowRef:PropTypes.func.isRequired,setFloaterRef:PropTypes.func.isRequired,showCloseButton:PropTypes.bool,status:PropTypes.string.isRequired,styles:PropTypes.object.isRequired,title:PropTypes.node});

  var ReactFloaterWrapper=/*#__PURE__*/function(_React$Component){_inherits(ReactFloaterWrapper,_React$Component);function ReactFloaterWrapper(){_classCallCheck(this,ReactFloaterWrapper);return _possibleConstructorReturn(this,_getPrototypeOf(ReactFloaterWrapper).apply(this,arguments));}_createClass(ReactFloaterWrapper,[{key:"render",value:function render(){var _this$props=this.props,children=_this$props.children,handleClick=_this$props.handleClick,handleMouseEnter=_this$props.handleMouseEnter,handleMouseLeave=_this$props.handleMouseLeave,setChildRef=_this$props.setChildRef,setWrapperRef=_this$props.setWrapperRef,style=_this$props.style,styles=_this$props.styles;var element;/* istanbul ignore else */if(children){if(React.Children.count(children)===1){if(!React.isValidElement(children)){element=React.createElement("span",null,children);}else{var refProp=is["function"](children.type)?'innerRef':'ref';element=React.cloneElement(React.Children.only(children),_defineProperty({},refProp,setChildRef));}}else{element=children;}}if(!element){return null;}return React.createElement("span",{ref:setWrapperRef,style:_objectSpread2({},styles,{},style),onClick:handleClick,onMouseEnter:handleMouseEnter,onMouseLeave:handleMouseLeave},element);}}]);return ReactFloaterWrapper;}(React.Component);_defineProperty(ReactFloaterWrapper,"propTypes",{children:PropTypes.node,handleClick:PropTypes.func.isRequired,handleMouseEnter:PropTypes.func.isRequired,handleMouseLeave:PropTypes.func.isRequired,setChildRef:PropTypes.func.isRequired,setWrapperRef:PropTypes.func.isRequired,style:PropTypes.object,styles:PropTypes.object.isRequired});

  var defaultOptions={zIndex:100};function getStyles(styles){var options=cjs(defaultOptions,styles.options||{});return {wrapper:{cursor:'help',display:'inline-flex',flexDirection:'column',zIndex:options.zIndex},wrapperPosition:{left:-1000,position:'absolute',top:-1000,visibility:'hidden'},floater:{display:'inline-block',filter:'drop-shadow(0 0 3px rgba(0, 0, 0, 0.3))',maxWidth:300,opacity:0,position:'relative',transition:'opacity 0.3s',visibility:'hidden',zIndex:options.zIndex},floaterOpening:{opacity:1,visibility:'visible'},floaterWithAnimation:{opacity:1,transition:'opacity 0.3s, transform 0.2s',visibility:'visible'},floaterWithComponent:{maxWidth:'100%'},floaterClosing:{opacity:0,visibility:'visible'},floaterCentered:{left:'50%',position:'fixed',top:'50%',transform:'translate(-50%, -50%)'},container:{backgroundColor:'#fff',color:'#666',minHeight:60,minWidth:200,padding:20,position:'relative',zIndex:10},title:{borderBottom:'1px solid #555',color:'#555',fontSize:18,marginBottom:5,paddingBottom:6,paddingRight:18},content:{fontSize:15},close:{backgroundColor:'transparent',border:0,borderRadius:0,color:'#555',fontSize:0,height:15,outline:'none',padding:10,position:'absolute',right:0,top:0,width:15,WebkitAppearance:'none'},footer:{borderTop:'1px solid #ccc',fontSize:13,marginTop:10,paddingTop:5},arrow:{color:'#fff',display:'inline-flex',length:16,margin:8,position:'absolute',spread:32},options:options};}

  var POSITIONING_PROPS=['position','top','right','bottom','left'];var ReactFloater=/*#__PURE__*/function(_React$Component){_inherits(ReactFloater,_React$Component);function ReactFloater(props){var _this;_classCallCheck(this,ReactFloater);_this=_possibleConstructorReturn(this,_getPrototypeOf(ReactFloater).call(this,props));/* istanbul ignore else */_defineProperty(_assertThisInitialized(_this),"setArrowRef",function(ref){_this.arrowRef=ref;});_defineProperty(_assertThisInitialized(_this),"setChildRef",function(ref){_this.childRef=ref;});_defineProperty(_assertThisInitialized(_this),"setFloaterRef",function(ref){if(!_this.floaterRef){_this.floaterRef=ref;}});_defineProperty(_assertThisInitialized(_this),"setWrapperRef",function(ref){_this.wrapperRef=ref;});_defineProperty(_assertThisInitialized(_this),"handleTransitionEnd",function(){var status=_this.state.status;var callback=_this.props.callback;/* istanbul ignore else */if(_this.wrapperPopper){_this.wrapperPopper.instance.update();}_this.setState({status:status===STATUS.OPENING?STATUS.OPEN:STATUS.IDLE},function(){var newStatus=_this.state.status;callback(newStatus===STATUS.OPEN?'open':'close',_this.props);});});_defineProperty(_assertThisInitialized(_this),"handleClick",function(){var _this$props=_this.props,event=_this$props.event,open=_this$props.open;if(is["boolean"](open))return;var _this$state=_this.state,positionWrapper=_this$state.positionWrapper,status=_this$state.status;/* istanbul ignore else */if(_this.event==='click'||_this.event==='hover'&&positionWrapper){log({title:'click',data:[{event:event,status:status===STATUS.OPEN?'closing':'opening'}],debug:_this.debug});_this.toggle();}});_defineProperty(_assertThisInitialized(_this),"handleMouseEnter",function(){var _this$props2=_this.props,event=_this$props2.event,open=_this$props2.open;if(is["boolean"](open)||isMobile())return;var status=_this.state.status;/* istanbul ignore else */if(_this.event==='hover'&&status===STATUS.IDLE){log({title:'mouseEnter',data:[{key:'originalEvent',value:event}],debug:_this.debug});clearTimeout(_this.eventDelayTimeout);_this.toggle();}});_defineProperty(_assertThisInitialized(_this),"handleMouseLeave",function(){var _this$props3=_this.props,event=_this$props3.event,eventDelay=_this$props3.eventDelay,open=_this$props3.open;if(is["boolean"](open)||isMobile())return;var _this$state2=_this.state,status=_this$state2.status,positionWrapper=_this$state2.positionWrapper;/* istanbul ignore else */if(_this.event==='hover'){log({title:'mouseLeave',data:[{key:'originalEvent',value:event}],debug:_this.debug});if(!eventDelay){_this.toggle(STATUS.IDLE);}else if([STATUS.OPENING,STATUS.OPEN].indexOf(status)!==-1&&!positionWrapper&&!_this.eventDelayTimeout){_this.eventDelayTimeout=setTimeout(function(){delete _this.eventDelayTimeout;_this.toggle();},eventDelay*1000);}}});_this.state={currentPlacement:props.placement,positionWrapper:props.wrapperOptions.position&&!!props.target,status:STATUS.INIT,statusWrapper:STATUS.INIT};_this._isMounted=false;if(canUseDOM){window.addEventListener('load',function(){if(_this.popper){_this.popper.instance.update();}if(_this.wrapperPopper){_this.wrapperPopper.instance.update();}});}return _this;}_createClass(ReactFloater,[{key:"componentDidMount",value:function componentDidMount(){if(!canUseDOM)return;var positionWrapper=this.state.positionWrapper;var _this$props5=this.props,children=_this$props5.children,open=_this$props5.open,target=_this$props5.target;this._isMounted=true;log({title:'init',data:{hasChildren:!!children,hasTarget:!!target,isControlled:is["boolean"](open),positionWrapper:positionWrapper,target:this.target,floater:this.floaterRef},debug:this.debug});this.initPopper();if(!children&&target&&!is["boolean"](open));}},{key:"componentDidUpdate",value:function componentDidUpdate(prevProps,prevState){if(!canUseDOM)return;var _this$props6=this.props,autoOpen=_this$props6.autoOpen,open=_this$props6.open,target=_this$props6.target,wrapperOptions=_this$props6.wrapperOptions;var _treeChanges=treeChanges(prevState,this.state),changedFrom=_treeChanges.changedFrom,changedTo=_treeChanges.changedTo;if(prevProps.open!==open){var forceStatus;// always follow `open` in controlled mode
  if(is["boolean"](open)){forceStatus=open?STATUS.OPENING:STATUS.CLOSING;}this.toggle(forceStatus);}if(prevProps.wrapperOptions.position!==wrapperOptions.position||prevProps.target!==target){this.changeWrapperPosition(this.props);}if(changedTo('status',STATUS.IDLE)&&open){this.toggle(STATUS.OPEN);}else if(changedFrom('status',STATUS.INIT,STATUS.IDLE)&&autoOpen){this.toggle(STATUS.OPEN);}if(this.popper&&changedTo('status',STATUS.OPENING)){this.popper.instance.update();}if(this.floaterRef&&(changedTo('status',STATUS.OPENING)||changedTo('status',STATUS.CLOSING))){once(this.floaterRef,'transitionend',this.handleTransitionEnd);}}},{key:"componentWillUnmount",value:function componentWillUnmount(){if(!canUseDOM)return;this._isMounted=false;if(this.popper){this.popper.instance.destroy();}if(this.wrapperPopper){this.wrapperPopper.instance.destroy();}}},{key:"initPopper",value:function initPopper(){var _this2=this;var target=arguments.length>0&&arguments[0]!==undefined?arguments[0]:this.target;var positionWrapper=this.state.positionWrapper;var _this$props7=this.props,disableFlip=_this$props7.disableFlip,getPopper=_this$props7.getPopper,hideArrow=_this$props7.hideArrow,offset=_this$props7.offset,placement=_this$props7.placement,wrapperOptions=_this$props7.wrapperOptions;var flipBehavior=placement==='top'||placement==='bottom'?'flip':['right','bottom-end','top-end','left','top-start','bottom-start'];/* istanbul ignore else */if(placement==='center'){this.setState({status:STATUS.IDLE});}else if(target&&this.floaterRef){var _this$options=this.options,arrow=_this$options.arrow,flip=_this$options.flip,offsetOptions=_this$options.offset,rest=_objectWithoutProperties(_this$options,["arrow","flip","offset"]);new Popper(target,this.floaterRef,{placement:placement,modifiers:_objectSpread2({arrow:_objectSpread2({enabled:!hideArrow,element:this.arrowRef},arrow),flip:_objectSpread2({enabled:!disableFlip,behavior:flipBehavior},flip),offset:_objectSpread2({offset:"0, ".concat(offset,"px")},offsetOptions)},rest),onCreate:function onCreate(data){_this2.popper=data;getPopper(data,'floater');if(_this2._isMounted){_this2.setState({currentPlacement:data.placement,status:STATUS.IDLE});}if(placement!==data.placement){setTimeout(function(){data.instance.update();},1);}},onUpdate:function onUpdate(data){_this2.popper=data;var currentPlacement=_this2.state.currentPlacement;if(_this2._isMounted&&data.placement!==currentPlacement){_this2.setState({currentPlacement:data.placement});}}});}if(positionWrapper){var wrapperOffset=!is.undefined(wrapperOptions.offset)?wrapperOptions.offset:0;new Popper(this.target,this.wrapperRef,{placement:wrapperOptions.placement||placement,modifiers:{arrow:{enabled:false},offset:{offset:"0, ".concat(wrapperOffset,"px")},flip:{enabled:false}},onCreate:function onCreate(data){_this2.wrapperPopper=data;if(_this2._isMounted){_this2.setState({statusWrapper:STATUS.IDLE});}getPopper(data,'wrapper');if(placement!==data.placement){setTimeout(function(){data.instance.update();},1);}}});}}},{key:"changeWrapperPosition",value:function changeWrapperPosition(_ref){var target=_ref.target,wrapperOptions=_ref.wrapperOptions;this.setState({positionWrapper:wrapperOptions.position&&!!target});}},{key:"toggle",value:function toggle(forceStatus){var status=this.state.status;var nextStatus=status===STATUS.OPEN?STATUS.CLOSING:STATUS.OPENING;if(!is.undefined(forceStatus)){nextStatus=forceStatus;}this.setState({status:nextStatus});}},{key:"render",value:function render(){var _this$state3=this.state,currentPlacement=_this$state3.currentPlacement,positionWrapper=_this$state3.positionWrapper,status=_this$state3.status;var _this$props8=this.props,children=_this$props8.children,component=_this$props8.component,content=_this$props8.content,disableAnimation=_this$props8.disableAnimation,footer=_this$props8.footer,hideArrow=_this$props8.hideArrow,id=_this$props8.id,open=_this$props8.open,showCloseButton=_this$props8.showCloseButton,style=_this$props8.style,target=_this$props8.target,title=_this$props8.title;var wrapper=React.createElement(ReactFloaterWrapper,{handleClick:this.handleClick,handleMouseEnter:this.handleMouseEnter,handleMouseLeave:this.handleMouseLeave,setChildRef:this.setChildRef,setWrapperRef:this.setWrapperRef,style:style,styles:this.styles.wrapper},children);var output={};if(positionWrapper){output.wrapperInPortal=wrapper;}else{output.wrapperAsChildren=wrapper;}return React.createElement("span",null,React.createElement(ReactFloaterPortal,{hasChildren:!!children,id:id,placement:currentPlacement,setRef:this.setFloaterRef,target:target,zIndex:this.styles.options.zIndex},React.createElement(Floater,{component:component,content:content,disableAnimation:disableAnimation,footer:footer,handleClick:this.handleClick,hideArrow:hideArrow||currentPlacement==='center',open:open,placement:currentPlacement,positionWrapper:positionWrapper,setArrowRef:this.setArrowRef,setFloaterRef:this.setFloaterRef,showCloseButton:showCloseButton,status:status,styles:this.styles,title:title}),output.wrapperInPortal),output.wrapperAsChildren);}},{key:"debug",get:function get(){var debug=this.props.debug;return debug||!!global.ReactFloaterDebug;}},{key:"event",get:function get(){var _this$props9=this.props,disableHoverToClick=_this$props9.disableHoverToClick,event=_this$props9.event;if(event==='hover'&&isMobile()&&!disableHoverToClick){return 'click';}return event;}},{key:"options",get:function get(){var options=this.props.options;return cjs(DEFAULTS,options||{});}},{key:"styles",get:function get(){var _this3=this;var _this$state4=this.state,status=_this$state4.status,positionWrapper=_this$state4.positionWrapper,statusWrapper=_this$state4.statusWrapper;var styles=this.props.styles;var nextStyles=cjs(getStyles(styles),styles);if(positionWrapper){var wrapperStyles;if(!([STATUS.IDLE].indexOf(status)!==-1)||!([STATUS.IDLE].indexOf(statusWrapper)!==-1)){wrapperStyles=nextStyles.wrapperPosition;}else{wrapperStyles=this.wrapperPopper.styles;}nextStyles.wrapper=_objectSpread2({},nextStyles.wrapper,{},wrapperStyles);}/* istanbul ignore else */if(this.target){var targetStyles=window.getComputedStyle(this.target);/* istanbul ignore else */if(this.wrapperStyles){nextStyles.wrapper=_objectSpread2({},nextStyles.wrapper,{},this.wrapperStyles);}else if(!(['relative','static'].indexOf(targetStyles.position)!==-1)){this.wrapperStyles={};if(!positionWrapper){POSITIONING_PROPS.forEach(function(d){_this3.wrapperStyles[d]=targetStyles[d];});nextStyles.wrapper=_objectSpread2({},nextStyles.wrapper,{},this.wrapperStyles);this.target.style.position='relative';this.target.style.top='auto';this.target.style.right='auto';this.target.style.bottom='auto';this.target.style.left='auto';}}}return nextStyles;}},{key:"target",get:function get(){if(!canUseDOM)return null;var target=this.props.target;if(target){if(is.domElement(target)){return target;}return document.querySelector(target);}return this.childRef||this.wrapperRef;}}]);return ReactFloater;}(React.Component);_defineProperty(ReactFloater,"propTypes",{autoOpen:PropTypes.bool,callback:PropTypes.func,children:PropTypes.node,component:isRequiredIf(PropTypes.oneOfType([PropTypes.func,PropTypes.element]),function(props){return !props.content;}),content:isRequiredIf(PropTypes.node,function(props){return !props.component;}),debug:PropTypes.bool,disableAnimation:PropTypes.bool,disableFlip:PropTypes.bool,disableHoverToClick:PropTypes.bool,event:PropTypes.oneOf(['hover','click']),eventDelay:PropTypes.number,footer:PropTypes.node,getPopper:PropTypes.func,hideArrow:PropTypes.bool,id:PropTypes.oneOfType([PropTypes.string,PropTypes.number]),offset:PropTypes.number,open:PropTypes.bool,options:PropTypes.object,placement:PropTypes.oneOf(['top','top-start','top-end','bottom','bottom-start','bottom-end','left','left-start','left-end','right','right-start','right-end','auto','center']),showCloseButton:PropTypes.bool,style:PropTypes.object,styles:PropTypes.object,target:PropTypes.oneOfType([PropTypes.object,PropTypes.string]),title:PropTypes.node,wrapperOptions:PropTypes.shape({offset:PropTypes.number,placement:PropTypes.oneOf(['top','top-start','top-end','bottom','bottom-start','bottom-end','left','left-start','left-end','right','right-start','right-end','auto']),position:PropTypes.bool})});_defineProperty(ReactFloater,"defaultProps",{autoOpen:false,callback:noop,debug:false,disableAnimation:false,disableFlip:false,disableHoverToClick:false,event:'click',eventDelay:0.4,getPopper:noop,hideArrow:false,offset:15,placement:'bottom',showCloseButton:false,styles:{},target:null,wrapperOptions:{position:false}});

  return ReactFloater;

})));
