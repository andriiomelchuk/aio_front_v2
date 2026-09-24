import { AppointmentDetail } from "@/features/admin/services";

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppointmentDetail appointmentId={id} />;
}
