"use client";
import { useState } from "react";
import { AdminContent } from "../AdminContent";
import { AdminHeader } from "../AdminHeader";
import { AdminSidebar } from "../AdminSidebar";
import { useAdminAccess } from "@/features/auth";
import { useI18n } from "@/shared/i18n";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { role } = useAdminAccess();
    const { t } = useI18n();

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="min-w-0">
        <AdminHeader onMenuClick={openSidebar}/>
        <AdminContent>
          {role === "viewer" && (
            <p className="mb-4 border border-warning bg-warning/10 px-4 py-3 text-sm text-foreground" role="status">
              {t("admin.auth.readOnlyNotice")}
            </p>
          )}
          <div className="min-w-0">{children}</div>
        </AdminContent>
      </div>
    </div>
  );
};
