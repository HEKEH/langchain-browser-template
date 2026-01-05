/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // 在客户端构建时，添加 Node.js polyfills
    if (!isServer) {
      const path = require('path');
      const stubPath = path.resolve(__dirname, 'app/lib/node-stubs.js');

      // 关键：webpack 5 在遇到 node: scheme 时会直接报错，因为它不支持这个 URI scheme
      // 我们需要创建一个自定义插件在模块解析之前拦截
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

      // 使用自定义插件在最早的阶段拦截
      config.plugins.unshift(new NodeSchemeAliasPlugin(stubPath));

      // 同时保留 NormalModuleReplacementPlugin 作为备用
      config.plugins.unshift(
        new webpack.NormalModuleReplacementPlugin(
          /^node:async_hooks$/,
          stubPath
        )
      );

      // 添加 Node.js polyfills（处理常见的 Node.js 模块）
      config.plugins.push(
        new NodePolyfillPlugin({
          excludeAliases: ['async_hooks'], // 排除 async_hooks，使用自定义实现
        })
      );

      // 关键：在 resolve.alias 中设置，这是 webpack 解析模块的第一站
      // 必须在 NormalModuleReplacementPlugin 之前生效
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      // 将 Node.js 内置模块映射到浏览器兼容的版本
      // resolve.alias 在模块解析的最早阶段生效
      config.resolve.alias['node:async_hooks'] = stubPath;
      // 不可用的模块设置为 false
      config.resolve.alias['node:fs'] = false;
      config.resolve.alias['node:net'] = false;
      config.resolve.alias['node:tls'] = false;

      // 确保 resolve 配置允许处理这些别名
      if (!config.resolve.extensionAlias) {
        config.resolve.extensionAlias = {};
      }

      // 将其他 node: 前缀的模块映射到非前缀版本，让 polyfills 处理
      // 例如 node:path -> path (由 NodePolyfillPlugin 提供)
      const polyfillableModules = ['path', 'url', 'util', 'stream', 'crypto', 'zlib', 'http', 'https', 'os', 'assert'];
      polyfillableModules.forEach(moduleName => {
        if (!config.resolve.alias[`node:${moduleName}`]) {
          config.resolve.alias[`node:${moduleName}`] = moduleName;
        }
      });

      // 设置 fallback - NodePolyfillPlugin 会自动填充大部分模块
      // 对于无法在浏览器中实现的模块，设置为 false
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // 文件系统和网络相关模块在浏览器中不可用
        fs: false,
        net: false,
        tls: false,
        // async_hooks 需要特殊处理，使用自定义 stub
        async_hooks: stubPath,
      };
    }

    return config;
  },
}

module.exports = nextConfig

