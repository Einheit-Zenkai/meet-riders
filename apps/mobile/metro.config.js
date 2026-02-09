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

// ---------------------------------------------------------------------------
// Axios fix: force the *browser* build so it never imports Node built-ins.
// Axios 1.x's main entry → dist/node/axios.cjs which pulls in crypto, http,
// url, http2, stream, zlib, etc.  The browser build uses XMLHttpRequest and
// needs none of those.
// ---------------------------------------------------------------------------
const emptyModule = path.resolve(projectRoot, 'shims/empty-module.js');

// Well-known Node built-ins that must never reach the RN runtime.
const NODE_BUILTINS = new Set([
	'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns',
	'events', 'fs', 'http', 'http2', 'https', 'net', 'os', 'path',
	'querystring', 'readline', 'stream', 'string_decoder', 'tls', 'tty',
	'url', 'util', 'v8', 'vm', 'worker_threads', 'zlib',
]);

config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
};

// Map every Node built-in to the empty shim so Metro never chokes.
for (const mod of NODE_BUILTINS) {
	config.resolver.extraNodeModules[mod] = emptyModule;
}
// Keep the crypto shim that provides randomUUID for Supabase/axios.
config.resolver.extraNodeModules.crypto = path.resolve(projectRoot, 'shims/crypto.js');

// Intercept resolution: redirect axios's Node entry to its browser CJS build.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	// axios/index.js → dist/node/axios.cjs  — swap to → dist/browser/axios.cjs
	if (
		moduleName === './dist/node/axios.cjs' ||
		moduleName.endsWith('/axios/dist/node/axios.cjs')
	) {
		const browserName = moduleName.replace('/dist/node/', '/dist/browser/');
		if (defaultResolveRequest) {
			return defaultResolveRequest(context, browserName, platform);
		}
		return context.resolveRequest(context, browserName, platform);
	}
	if (defaultResolveRequest) {
		return defaultResolveRequest(context, moduleName, platform);
	}
	return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
