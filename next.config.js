/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Compiler for better performance
  experimental: {
    reactCompiler: true,
    // Configure client-side router cache
    staleTimes: {
      dynamic: 30,  // 30 seconds for dynamic routes
      static: 180,  // 3 minutes for static routes
    },
  },
  // Use Redis cache handler for distributed deployments
  cacheHandler: process.env.NODE_ENV === 'production' 
    ? require.resolve('./cache-handler.js') 
    : undefined,
  cacheMaxMemorySize: process.env.NODE_ENV === 'production' 
    ? 0  // Disable in-memory caching in production
    : 50, // Default 50MB in development
  // Bundle dependencies for Pages Router
  bundlePagesRouterDependencies: true,
  // External packages that should be bundled by the server
  serverExternalPackages: ['ioredis'],
}

module.exports = nextConfig

