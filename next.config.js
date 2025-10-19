/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: "/android",
        destination: "https://play.google.com/store/apps/details?id=com.scheduli.schedulimobile",
        permanent: true
      },
      {
        source: "/ios",
        destination: "https://apps.apple.com/us/app/scheduli/id6470429917",
        permanent: true
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: "/relay-xzT1/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*"
      },
      {
        source: "/relay-xzT1/:path*",
        destination: "https://us.i.posthog.com/:path*"
      }
    ];
  }
};

module.exports = nextConfig;
