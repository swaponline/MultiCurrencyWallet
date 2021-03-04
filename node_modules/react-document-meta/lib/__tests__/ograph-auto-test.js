import React from 'react';
import TestUtils from 'react-dom/test-utils';
import DocumentMeta from '../';
import { removeDocumentMeta } from '../dom';

const document = global.document;

describe('Auto generate OGraph meta tags', () => {
  const META = {
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
    },
    auto: {
      ograph: true
    }
  };

  beforeEach(() => {
    DocumentMeta.canUseDOM = true;
    removeDocumentMeta();
  });

  it('use meta data to generate appropriate ograph tags', () => {
    TestUtils.renderIntoDocument(<DocumentMeta {...META} />);
    expect(document.title).toBe(META.title);
    expect(DocumentMeta.peek()).toMatchSnapshot();
  });
});
