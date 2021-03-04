const Babel = require('babel-core');

module.exports = [{
  ext: '.js',
  transform(content, filename) {
    if (filename.indexOf('node_modules') === -1) {
      return Babel.transform(content, {
        filename,
        sourceMap: 'inline',
        sourceFileName: filename
      }).code;
    }
    return content;
  }
}];
