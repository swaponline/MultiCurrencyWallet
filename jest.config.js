module.exports = {
  verbose: true,
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: "https://swaponline.io",
  },
  modulePaths: [
    "<rootDir>/src/",
    "<rootDir>/src/core",
    "<rootDir>/src/front/",
    "<rootDir>/src/front/shared",
    "<rootDir>/src/common",
    "<rootDir>/src/front/local_modules/",
  ],
  moduleNameMapper: {
    "^redux/(.*)$": "<rootDir>/src/front/shared/redux/$1",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(ethereumjs-wallet|uuid|@ethereumjs)/)",
  ],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
}
