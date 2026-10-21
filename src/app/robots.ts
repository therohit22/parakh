import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/companies", "/companies/*", "/questions", "/questions/*"],
      disallow: [
        "/api/",
        "/dashboard",
        "/bookmarks",
        "/solved",
        "/admin",
        "/admin/*",
      ],
    },
  };
}
