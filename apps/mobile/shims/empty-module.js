// Empty shim for Node.js built-in modules that don't exist in React Native.
// Axios 1.x's dist/node/axios.cjs imports several Node built-ins
// (url, http, https, stream, zlib, etc.) that are unavailable in RN.
// Mapping them here via Metro extraNodeModules prevents bundler crashes.
module.exports = {};
