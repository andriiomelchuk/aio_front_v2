import { ScheduleEditor } from "@/features/admin/services";

export default async function ServiceSchedulePage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  return <ScheduleEditor kind={kind === "location" ? "location" : "provider"} id={id} />;
}
