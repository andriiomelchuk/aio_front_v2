import { ServiceDetail } from "@/components/Services";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceDetail slug={slug} />;
}
