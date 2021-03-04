import assert from 'assert';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import DocumentMeta from '../';
import { removeDocumentMeta } from '../dom';
import { getElements, getAttr } from './test-utils';

const document = global.document;

describe('DocumentMeta - DOM nested', () => {
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

  const DOC_META_NESTED = {
    title: 'This is another document title',
    description: null,
    canonical: 'http://domain.tld/path/to/other',
    meta: {
      name: {
        keywords: 'react,document,meta,tags,nesting'
      }
    },
    link: {
      rel: {}
    }
  };

  beforeEach(() => {
    DocumentMeta.canUseDOM = true;
    removeDocumentMeta();
  });

  describe('Basic nested', () => {
    beforeEach(() => {
      TestUtils.renderIntoDocument(
        <div>
          <DocumentMeta {...DOC_META} />
          <div>
            <DocumentMeta {...DOC_META_NESTED} extend />
          </div>
        </div>
      );
    });

    it('should render document.title / <title> according to the nested title-prop', () => {
      assert.strictEqual(document.title, DOC_META_NESTED.title);
    });

    it('should render <meta name="description" content="..."> according to the nested description-prop', () => {
      assert.strictEqual(
        getAttr('meta[name=description]', 'content'),
        DOC_META_NESTED.description
      );
    });

    it('should render <link rel="canonical" href="..." according to the nested canonical-prop', () => {
      assert.strictEqual(
        getAttr('link[rel=canonical]', 'href'),
        DOC_META_NESTED.canonical
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
        const value = DOC_META_NESTED.meta.name.hasOwnProperty(name)
          ? DOC_META_NESTED.meta.name[name]
          : DOC_META.meta.name[name];
        assert.strictEqual(
          getAttr(`meta[name=${name}]`, 'content'),
          value,
          `<meta name="${name}" ... /> has not been rendered correctly`
        );
      });
    });

    it('should render normal link tags, eg. <link rel="..." href="...">', () => {
      Object.keys(DOC_META.link.rel).forEach(rel => {
        const value = DOC_META_NESTED.link.rel.hasOwnProperty(rel)
          ? DOC_META_NESTED.link.rel[rel]
          : DOC_META.link.rel[rel];
        const values = Array.isArray(value) ? value : [value];

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

  it('keep document.title if none is provided to DocumentMeta', () => {
    document.title = 'Static document title';
    TestUtils.renderIntoDocument(<DocumentMeta />);
    assert.strictEqual(document.title, 'Static document title');
    TestUtils.renderIntoDocument(
      <DocumentMeta title="Dynamic document title" />
    );
    assert.strictEqual(document.title, 'Dynamic document title');
  });

  describe('Deep nesting', () => {
    beforeEach(() => {
      TestUtils.renderIntoDocument(
        <DocumentMeta meta={{ name: { l1: 'a' } }}>
          <DocumentMeta meta={{ name: { l2: 'b' } }} extend>
            <DocumentMeta meta={{ name: { l3: 'c' } }}>
              <DocumentMeta meta={{ name: { l4: 'd' } }} extend />
            </DocumentMeta>
          </DocumentMeta>
        </DocumentMeta>
      );
    });

    it('should render inside-out, but only as long as the parent component is extendable', () => {
      const expected = { l4: 'd', l3: 'c' };
      const actual = {};

      const elements = getElements(`meta[name]`);
      for (const element of elements) {
        const name = element.getAttribute('name');
        actual[name] = element.getAttribute('content');
      }

      assert.deepEqual(
        expected,
        actual,
        `<meta name="..." content="..." /> has not been rendered correctly`
      );
    });
  });

  describe('Nesting with functions', () => {
    beforeEach(() => {
      TestUtils.renderIntoDocument(
        <DocumentMeta
          title={title => (title ? `${title} - Example.com` : 'Example.com')}
          description={desc => desc && `${desc.substr(0, 25)}...`}
          canonical={(path = '/') => `https://example.com${path}`}
        >
          <DocumentMeta
            title="Some page"
            description="This description is too long, at least for this test"
            canonical="/some-path"
            extend
          >
            <DocumentMeta
              title="Another page"
              description="This description is also too long, at least for this test"
              canonical="/another-path"
              extend
            />
          </DocumentMeta>
        </DocumentMeta>
      );
    });

    describe('title', () => {
      it('render inside-out, and pass inner value to outer function', () => {
        expect(document.title).toBe('Another page - Example.com');
      });
    });
    describe('description', () => {
      it('render inside-out, and pass inner value to outer function', () => {
        expect(getAttr('meta[name=description]', 'content')).toBe(
          'This description is also ...'
        );
      });
    });
    describe('canonical', () => {
      it('render inside-out, and pass inner value to outer function', () => {
        expect(getAttr('link[rel=canonical]', 'href')).toBe(
          'https://example.com/another-path'
        );
      });
    });
  });
});
