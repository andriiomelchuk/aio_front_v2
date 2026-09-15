import { ContentPageBuilder } from "@/features/admin/contentPages";

export default async function EditPagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ContentPageBuilder mode="edit" pageId={id} />;
}
