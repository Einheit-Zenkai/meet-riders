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
config.resolver.disableHierarchicalLookup = false;

// Prioritize browser/react-native builds over Node.js builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Work around Metro/Babel-runtime resolution problems on some setups.
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_enableSymlinks = true;

// Provide a crypto shim with randomUUID for Supabase.
config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	crypto: path.resolve(projectRoot, 'shims/crypto.js'),
};

// The workspace uses `node-linker=hoisted`, so the root node_modules is shared
// between the Next.js web app (React 19) and this Expo app (React 18). Without
// this pinning, react-native-web and friends pick up the hoisted React 19 copy
// while the app renders with React 18, causing "Objects are not valid as a
// React child" crashes. Force every React-related module to the mobile app's own
// React 18 installation.
const reactRoot = path.resolve(projectRoot, 'node_modules', 'react');
const reactDomRoot = path.resolve(projectRoot, 'node_modules', 'react-dom');
const schedulerRoot = path.resolve(projectRoot, 'node_modules', 'scheduler');
const reactSubpathFile = (moduleName) => {
	const sub = moduleName.slice('react/'.length);
	const map = { 'jsx-runtime': 'jsx-runtime.js', 'jsx-dev-runtime': 'jsx-dev-runtime.js' };
	return map[sub] ?? `${sub}.js`;
};
const reactDomSubpathFile = (moduleName) => {
	const sub = moduleName.slice('react-dom/'.length);
	const map = { client: 'client.js', 'server.browser': 'server.browser.js', server: 'server.browser.js' };
	return map[sub] ?? `${sub}.js`;
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === 'react') {
		return { filePath: path.join(reactRoot, 'index.js'), type: 'sourceFile' };
	}
	if (moduleName.startsWith('react/')) {
		return { filePath: path.join(reactRoot, reactSubpathFile(moduleName)), type: 'sourceFile' };
	}
	if (moduleName === 'react-dom') {
		return { filePath: path.join(reactDomRoot, 'index.js'), type: 'sourceFile' };
	}
	if (moduleName.startsWith('react-dom/')) {
		return { filePath: path.join(reactDomRoot, reactDomSubpathFile(moduleName)), type: 'sourceFile' };
	}
	if (moduleName === 'scheduler') {
		return { filePath: path.join(schedulerRoot, 'index.js'), type: 'sourceFile' };
	}
	return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
