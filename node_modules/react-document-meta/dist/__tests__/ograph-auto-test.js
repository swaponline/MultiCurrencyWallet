'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _testUtils = require('react-dom/test-utils');

var _testUtils2 = _interopRequireDefault(_testUtils);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _dom = require('../dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var document = global.document;

describe('Auto generate OGraph meta tags', function () {
  var META = {
    title: 'This is a document title',
    description: 'This meta value is describing the page we are looking at',
    canonical: 'http://domain.tld/path/to/page',
    meta: {
      charset: 'utf-8',
      name: {
        keywords: 'react,document,meta,tags'
      }
    },
    link: {
      rel: {
        stylesheet: ['http://domain.tld/css/vendor.css', 'http://domain.tld/css/styles.css']
      }
    },
    auto: {
      ograph: true
    }
  };

  beforeEach(function () {
    _2.default.canUseDOM = true;
    (0, _dom.removeDocumentMeta)();
  });

  it('use meta data to generate appropriate ograph tags', function () {
    _testUtils2.default.renderIntoDocument(_react2.default.createElement(_2.default, META));
    expect(document.title).toBe(META.title);
    expect(_2.default.peek()).toMatchSnapshot();
  });
});
