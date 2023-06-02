const path = require('path');

module.exports = {
  // ...
  resolve: {
    fallback: {
      "os": require.resolve("os-browserify/browser")
    }
  },
  // ...
};