import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/wp-content/uploads/2017/10/4e43547a-1616-4c14-9719-8d9ab88137de.jpg", permanent: true },
      { source: "/packages/", destination: "/information/", permanent: true },
      { source: "/calendar/", destination: "/contact-us/", permanent: true },
      { source: "/30160-2/", destination: "/contact-us/", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/page-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/post-sitemap.xml", destination: "/sitemap.xml", permanent: true },
    ];
  },
};

export default nextConfig;
