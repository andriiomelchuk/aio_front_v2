import type { Metadata } from "next";
import { ContentPageRenderer } from "@/components/ContentPage";

type T_ContentPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: T_ContentPageProps): Promise<Metadata> => {
  const { slug } = await params;

  return {
    title: "Content page",
    alternates: { canonical: `/${slug.toLowerCase()}` },
  };
};

export default async function PublicContentPage({ params }: T_ContentPageProps) {
  const { slug } = await params;

  return <ContentPageRenderer slug={slug} />;
}
