import { getBaseUrl, siteConfig } from "./config";

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.appName,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: getBaseUrl(),
    image: siteConfig.ogImage,
    creator: {
      "@type": "Organization",
      name: siteConfig.creator,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Persistent Memory Engine",
      "Health Analytics Dashboard",
      "AI Goal Tracking",
      "3D Avatar Companion",
      "Voice Conversations",
      "Multilingual Support",
      "Emotional Intelligence",
      "AI Health Insights",
      "Medication Tracking",
      "Sleep Tracking",
      "Blood Glucose Monitoring",
      "Weight Tracking",
    ],
    screenshot: siteConfig.ogImage,
    releaseNotes: `${getBaseUrl()}/`,
  };
}

export function webApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.appName,
    url: getBaseUrl(),
    description: siteConfig.description,
    applicationCategory: "HealthApplication",
    browserRequirements: "Requires modern browser with JavaScript enabled",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.creator,
    url: getBaseUrl(),
    description: "AI-powered health operating system with persistent memory, emotional intelligence, and proactive coaching.",
    foundingDate: "2026",
  };
}

export function faqPageSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

export function jsonLd(...schemas: Record<string, unknown>[]) {
  return schemas.map((schema) => (
    <script
      key={schema["@type"] as string}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}
