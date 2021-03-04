import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withSideEffect from 'react-side-effect';

import { clone, defaults } from './utils';

import { canUseDOM, insertDocumentMeta } from './dom';

function reducePropsTostate(propsList) {
  const props = {};
  const dynamicProps = {
    title: undefined,
    description: undefined,
    canonical: undefined
  };

  let extend = true;
  for (var i = propsList.length - 1; extend && i >= 0; i--) {
    extend = propsList[i].hasOwnProperty('extend');

    const _props = propsList[i];
    const _cloned = clone(propsList[i]);
    ['title', 'description', 'canonical'].forEach(key => {
      if (_props.hasOwnProperty(key)) {
        if (typeof _props[key] === 'function') {
          dynamicProps[key] = _props[key](dynamicProps[key]);
        } else if (dynamicProps[key] === undefined) {
          dynamicProps[key] = _props[key];
        }
      }
    });

    defaults(props, _cloned);
  }

  if (typeof dynamicProps.title === 'string') {
    props.title = dynamicProps.title;
  }
  if (typeof dynamicProps.description === 'string') {
    defaults(props, {
      meta: { name: { description: dynamicProps.description } }
    });
  }
  if (typeof dynamicProps.canonical === 'string') {
    defaults(props, { link: { rel: { canonical: dynamicProps.canonical } } });
  }

  if (props.auto && props.auto.ograph) {
    ograph(props);
  }

  return props;
}

function handleStateChangeOnClient(props) {
  if (canUseDOM) {
    if (typeof props.title === 'string') {
      document.title = props.title;
    }
    insertDocumentMeta(getTags(props));
  }
}

function ograph(p) {
  if (!p.meta) {
    p.meta = {};
  }
  if (!p.meta.property) {
    p.meta.property = {};
  }

  const group = p.meta.property;
  if (group) {
    if (p.title && !group['og:title']) {
      group['og:title'] = p.title;
    }
    if (p.hasOwnProperty('description') && !group['og:description']) {
      group['og:description'] = p.description;
    }
    if (p.hasOwnProperty('canonical') && !group['og:url']) {
      group['og:url'] = p.canonical;
    }
  }
  return p;
}

function parseTags(tagName, props = {}) {
  const tags = [];
  const contentKey = tagName === 'link' ? 'href' : 'content';
  Object.keys(props).forEach(groupKey => {
    const group = props[groupKey];
    if (typeof group === 'string') {
      tags.push({
        tagName,
        [groupKey]: group
      });
      return;
    }
    Object.keys(group).forEach(key => {
      const values = Array.isArray(group[key]) ? group[key] : [group[key]];
      values.forEach(value => {
        if (value !== null) {
          tags.push({
            tagName,
            [groupKey]: key,
            [contentKey]: value
          });
        }
      });
    });
  });
  return tags;
}

function getTags(_props) {
  return [].concat(
    parseTags('meta', _props.meta),
    parseTags('link', _props.link)
  );
}

export function render(meta = {}) {
  let i = 0;
  const tags = [];

  function renderTag(entry) {
    const { tagName, ...attr } = entry;

    if (tagName === 'meta') {
      return <meta {...attr} key={i++} data-rdm />;
    }
    if (tagName === 'link') {
      return <link {...attr} key={i++} data-rdm />;
    }
    return null;
  }

  if (meta.title) {
    tags.push(<title key={i++}>{meta.title}</title>);
  }

  return getTags(meta).reduce((acc, entry) => {
    acc.push(renderTag(entry));
    return acc;
  }, tags);
}

class DocumentMeta extends Component {
  static propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    canonical: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    base: PropTypes.string,
    meta: PropTypes.objectOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.objectOf(
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
          ])
        )
      ])
    ),
    link: PropTypes.objectOf(
      PropTypes.objectOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string)
        ])
      )
    ),
    auto: PropTypes.objectOf(PropTypes.bool)
  };

  render() {
    const { children } = this.props;
    const count = React.Children.count(children);
    return count === 1 ? (
      React.Children.only(children)
    ) : count ? (
      <div>{this.props.children}</div>
    ) : null;
  }
}

const DocumentMetaWithSideEffect = withSideEffect(
  reducePropsTostate,
  handleStateChangeOnClient
)(DocumentMeta);

DocumentMetaWithSideEffect.renderAsReact = function rewindAsReact() {
  return render(DocumentMetaWithSideEffect.rewind());
};

export default DocumentMetaWithSideEffect;
