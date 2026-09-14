import { AccountOrderDetail } from "@/components/Account";

type T_AccountOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AccountOrderPage({ params }: T_AccountOrderPageProps) {
  const { id } = await params;
  return <AccountOrderDetail orderId={id} />;
}
