"use client";
import { Button, Select } from "@/shared/ui";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";


export default function EcommercePage() {
  return (
    <AdminPage
      title="E-commerce"
      description="Manage products, orders and sales"
      actions={
        <>
          <Button
            variant="default"
            onClick={() => console.log("Add product")}
            className="h-10"
          >
            Add product
          </Button>
          <Select
            className="w-[180px]"
            name="status"
            defaultValue="all"
            aria-label="Filter orders by status"
            options={[
              { value: "all", label: "All statuses" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
            ]}
          />
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard title="Products">
          <p className="text-2xl font-semibold text-foreground">128</p>
          <p className="mt-1 text-sm text-muted">Active products</p>
        </AdminCard>

        <AdminCard title="Orders">
          <p className="text-2xl font-semibold text-foreground">42</p>
          <p className="mt-1 text-sm text-muted">Orders this week</p>
        </AdminCard>

        <AdminCard title="Revenue">
          <p className="text-2xl font-semibold text-foreground">$12,480</p>
          <p className="mt-1 text-sm text-muted">Monthly revenue</p>
        </AdminCard>
      </div>

      <div className="mt-4">
        <AdminCard title="Recent orders" description="Latest customer orders">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">Order #1024</span>
              <span className="text-sm text-muted">$240</span>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">Order #1025</span>
              <span className="text-sm text-muted">$89</span>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">Order #1026</span>
              <span className="text-sm text-muted">$410</span>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
