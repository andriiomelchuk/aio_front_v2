import { CustomerDetail } from "@/features/admin/customers";

type T_CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: T_CustomerDetailPageProps) {
  const { id } = await params;
  return <CustomerDetail customerId={id} />;
}
