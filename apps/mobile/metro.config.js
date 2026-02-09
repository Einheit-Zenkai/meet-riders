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

module.exports = config;
