/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false, // Use 307 temporary redirect
      },
    ];
  },
};

export default nextConfig;
