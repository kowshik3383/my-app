import type { MetadataRoute } from "next";
import { getBaseUrl, sitemapConfig } from "@/lib/seo/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const lastModified = now.toISOString().split("T")[0];

  const publicRoutes = sitemapConfig.publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changefreq as
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never",
    priority: route.priority,
  }));

  return publicRoutes;
}
