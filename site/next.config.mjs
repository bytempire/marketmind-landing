/** @type {import('next').NextConfig} */
const repo = "marketmind-landing";
const basePath =
  process.env.LANDING_BASE_PATH ??
  (process.env.GITHUB_PAGES === "true" ? `/${repo}` : "");

const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
