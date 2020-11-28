export default {
  verbose: true,
  testURL: "https://swap.online",
  setupTestFrameworkScriptFile: "./jest.setup.js",
  modulePaths: [
    "<rootDir>/src/",
    "<rootDir>/",
    "<rootDir>/../node_modules/swap.core/lib",
    "<rootDir>/../swap.core/lib",
    "<rootDir>/../../swap.core/lib",
  ]
}
