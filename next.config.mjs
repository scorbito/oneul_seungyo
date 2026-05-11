/** @type {import('next').NextConfig} */
const nextConfig = {
  // 디버깅: 운영 빌드에 소스맵 활성화 — React #310 정확한 위치 파악용.
  // 원인 찾으면 다시 false로 돌리거나 옵션 제거 예정.
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb"
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**"
      }
    ]
  }
};

export default nextConfig;
