const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const rootNodeModules = path.resolve(workspaceRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

// Watch shared packages
config.watchFolders = [
  path.resolve(workspaceRoot, 'packages'),
];

// Force ALL packages to resolve to the root node_modules singleton.
// This prevents "two copies of React" hook errors in monorepos.
config.resolver.extraNodeModules = {
  react: path.resolve(rootNodeModules, 'react'),
  'react-dom': path.resolve(rootNodeModules, 'react-dom'),
  'react-native': path.resolve(rootNodeModules, 'react-native'),
  'react-native-web': path.resolve(rootNodeModules, 'react-native-web'),
  'react-native-safe-area-context': path.resolve(rootNodeModules, 'react-native-safe-area-context'),
  'react-native-screens': path.resolve(rootNodeModules, 'react-native-screens'),
  '@react-navigation/native': path.resolve(rootNodeModules, '@react-navigation/native'),
  '@react-navigation/native-stack': path.resolve(rootNodeModules, '@react-navigation/native-stack'),
  '@react-navigation/bottom-tabs': path.resolve(rootNodeModules, '@react-navigation/bottom-tabs'),
};

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  rootNodeModules,
];

module.exports = config;
