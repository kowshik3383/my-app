import type { Metadata } from "next";
import { siteConfig, keywordsConfig } from "./config";
import { getBaseUrl } from "./config";

interface GenerateMetadataParams {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  alternates?: Record<string, string>;
}

export function generateMetadata({
  title,
  description,
  path = "",
  keywords,
  noindex = false,
  nofollow = false,
  ogImage,
  publishedTime,
  modifiedTime,
  section,
  alternates,
}: GenerateMetadataParams = {}): Metadata {
  const baseUrl = getBaseUrl();
  const url = path ? `${baseUrl}${path}` : baseUrl;
  const effectiveTitle = title
    ? `${title} | ${siteConfig.appName}`
    : siteConfig.appName;
  const effectiveDescription = description || siteConfig.description;
  const effectiveKeywords = keywords
    ? [...new Set([...keywords, ...siteConfig.keywords])]
    : siteConfig.keywords;

  const robots: Metadata["robots"] = {};
  if (noindex) robots.index = false;
  if (nofollow) robots.follow = false;
  if (!noindex && !nofollow) {
    robots.index = true;
    robots.follow = true;
  }

  return {
    title: effectiveTitle,
    description: effectiveDescription,
    keywords: effectiveKeywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
      ...(alternates && { languages: alternates }),
    },
    openGraph: {
      title: effectiveTitle,
      description: effectiveDescription,
      url,
      siteName: siteConfig.appName,
      images: [
        {
          url: ogImage || siteConfig.ogImage,
          width: 1200,
          height: 1200,
          alt: effectiveTitle,
        },
      ],
      locale: siteConfig.locale,
      type: section ? "article" : "website",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
    },
    twitter: {
      card: "summary_large_image",
      title: effectiveTitle,
      description: effectiveDescription,
      images: [ogImage || siteConfig.ogImage],
      site: siteConfig.twitterHandle,
    },
    robots,
    appleWebApp: {
      capable: true,
      title: siteConfig.name,
      statusBarStyle: "default",
    },
    applicationName: siteConfig.name,
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    category: siteConfig.category,
    ...(publishedTime && { "article:published_time": publishedTime }),
    ...(modifiedTime && { "article:modified_time": modifiedTime }),
  } as Metadata;
}

export function landingMetadata(): Metadata {
  return generateMetadata({
    path: "/",
    keywords: [
      ...keywordsConfig.primary,
      ...keywordsConfig.secondary,
    ],
  });
}

export function demoMetadata(): Metadata {
  return generateMetadata({
    title: "Avatar Studio",
    description:
      "Customize your AI health companion's 3D avatar. Choose outfits, animations, and skin tones for a personalized AI health assistant experience.",
    path: "/demo",
    keywords: keywordsConfig.clusters.avatar.primary,
    section: "demo",
  });
}

export function noindexMetadata(): Metadata {
  return generateMetadata({
    title: "App",
    noindex: true,
    nofollow: true,
    path: "/app",
  });
}
