// Root-level Jest config — only runs dateEngine.test.js
// Backend and frontend have their own Jest configs inside their directories.
export default {
  testMatch: ['<rootDir>/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/backend/', '/frontend/', '/reference/'],
};
