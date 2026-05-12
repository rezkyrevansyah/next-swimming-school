import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextswimmingschool.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/program`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tentang`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/kontak`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/daftar/member`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  try {
    const supabase = createClient(await cookies());
    const { data: classes } = await supabase
      .from("classes")
      .select("slug, updated_at")
      .eq("status", "active")
      .is("deleted_at", null);

    const classRoutes: MetadataRoute.Sitemap = (classes ?? []).map((c) => ({
      url: `${base}/program/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...classRoutes];
  } catch {
    return staticRoutes;
  }
}
