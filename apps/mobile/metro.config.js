const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// pnpm monorepo support (Metro needs to see the workspace root + follow symlinks).
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// Work around Metro/Babel-runtime resolution problems on some setups.
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_enableSymlinks = true;

// Shim Node.js built-ins that don't exist in React Native.
// Axios 1.x's dist/node/axios.cjs imports Node builtins (crypto, url, http,
// https, stream, zlib, …) which are absent in RN.  Map them to empty shims so
// Metro can resolve them without errors.
const emptyModule = path.resolve(projectRoot, 'shims/empty-module.js');
config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	crypto: path.resolve(projectRoot, 'shims/crypto.js'),
	url: emptyModule,
	http: emptyModule,
	https: emptyModule,
	stream: emptyModule,
	zlib: emptyModule,
	net: emptyModule,
	tls: emptyModule,
	dns: emptyModule,
	assert: emptyModule,
	os: emptyModule,
	child_process: emptyModule,
	fs: emptyModule,
	path: emptyModule,
	util: emptyModule,
	events: emptyModule,
	querystring: emptyModule,
	buffer: emptyModule,
};

module.exports = config;
