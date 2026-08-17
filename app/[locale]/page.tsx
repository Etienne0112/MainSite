import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { copy, languageAlternates, localePath, locales, type Locale } from "../i18n";
import WorkspaceDirectory from "../workspace-directory";

type PageProps = { params: Promise<{ locale: string }> };

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value) && value !== "ko";
}

export function generateStaticParams() {
  return locales.filter((locale) => locale !== "ko").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = copy[locale];
  return {
    title: "Everything of My Workspace — Site Directory",
    description: t.metaDescription,
    alternates: { canonical: localePath(locale), languages: languageAlternates },
    openGraph: {
      type: "website",
      url: localePath(locale),
      siteName: "Everything of My Workspace",
      title: "Everything of My Workspace",
      description: t.metaDescription,
      images: [{ url: "/MainSite/og-04.png", width: 1536, height: 1024, alt: "Everything of My Workspace" }],
    },
    twitter: { card: "summary_large_image", title: "Everything of My Workspace", description: t.metaDescription, images: ["/MainSite/og-04.png"] },
  };
}

export default async function LocalizedHome({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <WorkspaceDirectory locale={locale} />;
}
