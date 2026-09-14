import { CheckoutSuccess } from "@/components/Checkout";
import { redirect } from "next/navigation";

type T_CheckoutSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: T_CheckoutSuccessPageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/checkout");
  }

  return <CheckoutSuccess orderId={orderId} />;
}
