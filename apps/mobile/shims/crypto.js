// Shim for Node.js 'crypto' module in React Native.
// Axios 1.x attempts to import 'crypto' for UUID generation, but
// React Native doesn't provide Node built-ins. This shim provides a
// minimal randomUUID backed by expo-crypto (already a project dep).

let _randomUUID;

try {
  const { randomUUID } = require('expo-crypto');
  _randomUUID = randomUUID;
} catch {
  // Fallback: return a v4-like UUID using Math.random (not cryptographically
  // secure, but sufficient for axios request ids).
  _randomUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

module.exports = { randomUUID: _randomUUID };
