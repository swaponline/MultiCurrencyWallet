import assert from 'assert';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import DocumentMeta from '../';
import { removeDocumentMeta } from '../dom';
import { getElements, getAttr } from './test-utils';

const document = global.document;

describe('DocumentMeta - DOM basic', () => {
  const DOC_META = {
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
        stylesheet: [
          'http://domain.tld/css/vendor.css',
          'http://domain.tld/css/styles.css'
        ]
      }
    }
  };

  beforeEach(() => {
    DocumentMeta.canUseDOM = true;
    removeDocumentMeta();
    TestUtils.renderIntoDocument(<DocumentMeta {...DOC_META} />);
  });

  it('should render document.title / <title> according to the title-attr', () => {
    assert.strictEqual(document.title, DOC_META.title);
  });

  it('should render <meta name="description" content="..."> according to the description-attr', () => {
    assert.strictEqual(
      getAttr('meta[name=description]', 'content'),
      DOC_META.description
    );
  });

  it('should render <link rel="canonical" href="..." according to the canonical-attr', () => {
    assert.strictEqual(
      getAttr('link[rel=canonical]', 'href'),
      DOC_META.canonical
    );
  });

  it('should render simple meta tags, eg. <meta charset="...">', () => {
    assert.strictEqual(
      getAttr('meta[charset]', 'charset'),
      DOC_META.meta.charset
    );
  });

  it('should render normal meta tags, eg. <meta name="..." content="...">', () => {
    Object.keys(DOC_META.meta.name).forEach(name => {
      assert.strictEqual(
        getAttr(`meta[name=${name}]`, 'content'),
        DOC_META.meta.name[name],
        `<meta name="${name}" ... /> has not been rendered correctly`
      );
    });
  });

  it('should render normal link tags, eg. <link rel="..." href="...">', () => {
    Object.keys(DOC_META.link.rel).forEach(rel => {
      const values = Array.isArray(DOC_META.link.rel[rel])
        ? DOC_META.link.rel[rel]
        : [DOC_META.link.rel[rel]];
      let idx = 0;
      const elements = getElements(`link[rel=${rel}]`);
      for (const element of elements) {
        assert.strictEqual(
          element.getAttribute('href'),
          values[idx++],
          `<link rel="${rel}" ... /> has not been rendered correctly`
        );
      }
    });
  });
});
