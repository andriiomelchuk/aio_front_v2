import { OrderDetailPageContent } from "@/features/admin/orders";

type T_AdminOrderPageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderPage({ params }: T_AdminOrderPageProps) {
  const { id } = await params;
  return <OrderDetailPageContent orderId={id} />;
}
