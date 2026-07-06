"use client"
import { Button } from "@/shared/ui";
import { AdminBadge, AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";


const users = [
  {
    id: 1,
    name: "Anna Smith",
    email: "anna@example.com",
    role: "Admin",
    status: <AdminBadge variant="success">Active</AdminBadge>,
    action: <Button className="h-10" variant="ghost" onClick={() => console.log("Edit user")}>Edit</Button>
  },
  {
    id: 2,
    name: "Mark Stone",
    email: "mark@example.com",
    role: "Editor",
    status: <AdminBadge variant="neutral">Invited</AdminBadge>,
    action: <Button className="h-10" variant="ghost" onClick={() => console.log("Edit user")}>Edit</Button>
  },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
] as const;

export default function UsersPage() {
  return (
    <AdminPage
      title="Users"
      description="Manage registered users and their permissions"
      actions={
        <Button variant="default" className="h-10" onClick={() => console.log("Add user")}>
          Add User
        </Button>
      }
    >
      <AdminCard
        title="Users list"
        description="All registered accounts in the system"
      >
        <AdminTable columns={columns} rows={users} getRowKey={(user) => user.id} />
      </AdminCard>
    </AdminPage>
  );
}