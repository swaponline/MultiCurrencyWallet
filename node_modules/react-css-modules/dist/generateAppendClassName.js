'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SimpleMap = require('./SimpleMap');

var _SimpleMap2 = _interopRequireDefault(_SimpleMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CustomMap = typeof Map === 'undefined' ? _SimpleMap2.default : Map;

var stylesIndex = new CustomMap();

exports.default = function (styles, styleNames, handleNotFoundStyleName) {
  var appendClassName = void 0;
  var stylesIndexMap = void 0;

  stylesIndexMap = stylesIndex.get(styles);

  if (stylesIndexMap) {
    var styleNameIndex = stylesIndexMap.get(styleNames);

    if (styleNameIndex) {
      return styleNameIndex;
    }
  } else {
    stylesIndexMap = new CustomMap();
    stylesIndex.set(styles, new CustomMap());
  }

  appendClassName = '';

  for (var styleName in styleNames) {
    if (styleNames.hasOwnProperty(styleName)) {
      var className = styles[styleNames[styleName]];

      if (className) {
        appendClassName += ' ' + className;
      } else {
        if (handleNotFoundStyleName === 'throw') {
          throw new Error('"' + styleNames[styleName] + '" CSS module is undefined.');
        }
        if (handleNotFoundStyleName === 'log') {
          // eslint-disable-next-line no-console
          console.warn('"' + styleNames[styleName] + '" CSS module is undefined.');
        }
      }
    }
  }

  appendClassName = appendClassName.trim();

  stylesIndexMap.set(styleNames, appendClassName);

  return appendClassName;
};

module.exports = exports['default'];