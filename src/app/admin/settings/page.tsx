import { Checkbox, Select, Switch, Textarea } from "@/shared/ui";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";


export default function SettingsPage() {
  return (
    <AdminPage title="Settings" description="Configure application preferences">
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard
          title="General"
          description="Basic application configuration"
        >
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Site name
              </span>
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent"
                defaultValue="AIO Front"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">
                Enable notifications
              </span>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </AdminCard>

        <AdminCard
          title="Security"
          description="Authentication and access settings"
        >
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">
                Two-factor authentication
              </span>
              <input type="checkbox" />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">
                Admin approval required
              </span>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </AdminCard>
        <AdminCard
          title="Appearance"
          description="Customize the look and feel of the application"
        >
          <div className="space-y-3">
            <Select
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
          </div>
        </AdminCard>
        <AdminCard
          title="Product Description"
          description="Provide a detailed description of the product"
        >
          <Textarea
            label="Product description"
            name="description"
            placeholder="Describe product details"
            defaultValue="Premium product with extended warranty"
          />
        </AdminCard>
      </div>
      <AdminCard
        title="Preferences"
        description="Application behavior settings"
      >
        <div className="space-y-3">
          <Switch
            name="maintenanceMode"
            label="Maintenance mode"
            description="Temporarily disable public access"
          />

          <Switch
            name="emailAlerts"
            label="Email alerts"
            description="Send notifications about important events"
            defaultChecked
          />

          <Checkbox
            name="showAdvanced"
            label="Show advanced settings"
            description="Display additional configuration fields"
          />
        </div>
      </AdminCard>
    </AdminPage>
  );
}
