import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "CCBot",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
      {
        userAgent: "Amazonbot",
        allow: ["/", "/demo"],
        disallow: ["/api/", "/app/", "/test-cartesia/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
