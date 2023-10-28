/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  }
}

module.exports = nextConfig
