import DocumentMeta, { render } from './index';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function rewindAsStaticMarkup() {
  const tags = render(DocumentMeta.rewind());

  return renderToStaticMarkup(<div>{tags}</div>)
    .replace(/(^<div>|<\/div>$)/g, '')
    .replace(/data-rdm="true"/g, 'data-rdm');
}

export default DocumentMeta;

DocumentMeta.renderToStaticMarkup = rewindAsStaticMarkup;
DocumentMeta.renderAsHTML = rewindAsStaticMarkup;
