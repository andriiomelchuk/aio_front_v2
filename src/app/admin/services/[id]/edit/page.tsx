import { ServiceEditor } from "@/features/admin/services";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceEditor serviceId={id} />;
}
