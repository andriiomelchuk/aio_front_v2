import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";


export default function AnalyticsPage() {
  return (
    <AdminPage
      title="Analytics"
      description="Track traffic, performance and reports"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminCard title="Visitors">
          <p className="text-2xl font-semibold text-foreground">24.8k</p>
          <p className="mt-1 text-sm text-muted">+12% from last month</p>
        </AdminCard>

        <AdminCard title="Conversion">
          <p className="text-2xl font-semibold text-foreground">6.4%</p>
          <p className="mt-1 text-sm text-muted">+1.2% from last month</p>
        </AdminCard>

        <AdminCard title="Bounce rate">
          <p className="text-2xl font-semibold text-foreground">38%</p>
          <p className="mt-1 text-sm text-muted">-4% from last month</p>
        </AdminCard>

        <AdminCard title="Avg. session">
          <p className="text-2xl font-semibold text-foreground">3m 42s</p>
          <p className="mt-1 text-sm text-muted">+18s from last month</p>
        </AdminCard>
      </div>

      <div className="mt-4">
        <AdminCard
          title="Traffic overview"
          description="Placeholder for chart component"
        >
          <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted">
            Chart will be here
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}