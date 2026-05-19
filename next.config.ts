import type { NextConfig } from "next";

function supabaseImageHost(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return "*.supabase.co";
  try {
    return new URL(url).hostname;
  } catch {
    return "*.supabase.co";
  }
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/chat", destination: "/explore", permanent: false },
      { source: "/insights", destination: "/explore", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseImageHost(),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
