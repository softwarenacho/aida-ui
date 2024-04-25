/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const nextConfigFunction = async () => {
  const withPWA = (await import('@ducanh2912/next-pwa')).default({
    dest: 'public',
  });
  return withPWA(nextConfig);
};

export default nextConfigFunction;
