import type { Metadata } from "next";
import { ContentPageRenderer } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Content page",
};

export default async function PublicContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ContentPageRenderer slug={slug} />;
}
