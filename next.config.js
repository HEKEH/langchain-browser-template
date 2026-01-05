/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add Node.js polyfills for client-side builds
    if (!isServer) {
      const path = require('path');
      const stubPath = path.resolve(__dirname, 'lib/node-stubs.js');

      // Critical: webpack 5 throws an error when encountering the node: scheme because it doesn't support this URI scheme
      // We need to create a custom plugin to intercept before module resolution
      class NodeSchemeAliasPlugin {
        constructor(stubPath) {
          this.stubPath = stubPath;
        }
        apply(compiler) {
          compiler.hooks.normalModuleFactory.tap('NodeSchemeAliasPlugin', (nmf) => {
            nmf.hooks.beforeResolve.tap('NodeSchemeAliasPlugin', (data) => {
              if (data && data.request && data.request.startsWith('node:async_hooks')) {
                data.request = this.stubPath;
              }
            });
          });
        }
      }

      // Use custom plugin to intercept at the earliest stage
      config.plugins.unshift(new NodeSchemeAliasPlugin(stubPath));

      // Also keep NormalModuleReplacementPlugin as a fallback
      config.plugins.unshift(
        new webpack.NormalModuleReplacementPlugin(
          /^node:async_hooks$/,
          stubPath
        )
      );

      // Add Node.js polyfills (handles common Node.js modules)
      config.plugins.push(
        new NodePolyfillPlugin({
          excludeAliases: ['async_hooks'], // Exclude async_hooks, use custom implementation
        })
      );

      // Critical: Set in resolve.alias, this is webpack's first stop for module resolution
      // Must take effect before NormalModuleReplacementPlugin
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      // Map Node.js built-in modules to browser-compatible versions
      // resolve.alias takes effect at the earliest stage of module resolution
      config.resolve.alias['node:async_hooks'] = stubPath;
      // Set unavailable modules to false
      config.resolve.alias['node:fs'] = false;
      config.resolve.alias['node:net'] = false;
      config.resolve.alias['node:tls'] = false;

      // Ensure resolve configuration allows handling these aliases
      if (!config.resolve.extensionAlias) {
        config.resolve.extensionAlias = {};
      }

      // Map other node: prefixed modules to non-prefixed versions for polyfills to handle
      // For example, node:path -> path (provided by NodePolyfillPlugin)
      const polyfillableModules = ['path', 'url', 'util', 'stream', 'crypto', 'zlib', 'http', 'https', 'os', 'assert'];
      polyfillableModules.forEach(moduleName => {
        if (!config.resolve.alias[`node:${moduleName}`]) {
          config.resolve.alias[`node:${moduleName}`] = moduleName;
        }
      });

      // Set fallback - NodePolyfillPlugin will automatically polyfill most modules
      // Set modules that cannot be implemented in browsers to false
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // File system and network-related modules are not available in browsers
        fs: false,
        net: false,
        tls: false,
        // async_hooks requires special handling, use custom stub
        async_hooks: stubPath,
      };
    }

    return config;
  },
}

module.exports = nextConfig

