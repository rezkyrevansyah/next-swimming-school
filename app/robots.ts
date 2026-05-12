import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextswimmingschool.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/a/", "/c/", "/m/", "/o/", "/unauthorized"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
