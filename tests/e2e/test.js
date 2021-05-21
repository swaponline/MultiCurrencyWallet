const fs = require('fs')

// check if ./screenshots directory exists
if (!fs.existsSync('tests/e2e/screenshots')) {
  // create tests/e2e/screenshots directory
  fs.mkdir('tests/e2e/screenshots', (err) => {
    if (err) {
        throw err;
    }
    console.log("tests/e2e/screenshots directory is created.")
  })
}