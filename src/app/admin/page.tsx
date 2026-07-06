import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";


export default function AdminPanel() {
  return (
    <AdminPage
      title="Dashboard"
      description="Overview of the admin panel"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminCard title="Users">
          <p className="text-2xl font-semibold text-foreground">1,248</p>
          <p className="mt-1 text-sm text-muted">Total registered users</p>
        </AdminCard>

        <AdminCard title="Orders">
          <p className="text-2xl font-semibold text-foreground">342</p>
          <p className="mt-1 text-sm text-muted">Processed orders</p>
        </AdminCard>

        <AdminCard title="Revenue">
          <p className="text-2xl font-semibold text-foreground">$18.2k</p>
          <p className="mt-1 text-sm text-muted">This month</p>
        </AdminCard>

        <AdminCard title="Errors">
          <p className="text-2xl font-semibold text-danger">7</p>
          <p className="mt-1 text-sm text-muted">Requires attention</p>
        </AdminCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <AdminCard
          title="Activity"
          description="Recent system activity"
        >
          <div className="space-y-3">
            <p className="text-sm text-foreground">New user registered</p>
            <p className="text-sm text-foreground">Order #1026 completed</p>
            <p className="text-sm text-foreground">Settings updated</p>
          </div>
        </AdminCard>

        <AdminCard
          title="Status"
          description="System health"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">API</span>
              <span className="text-accent">Online</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted">Database</span>
              <span className="text-accent">Online</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted">Storage</span>
              <span className="text-danger">Warning</span>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}