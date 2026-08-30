/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Serve modern, well-compressed formats without visible quality loss.
    formats: ["image/avif", "image/webp"],
    // Premium look: keep a high quality ceiling for optimized images.
    qualities: [75, 85, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
}

export default nextConfig
