"use client";
import { useState } from "react";
import { AdminContent } from "../AdminContent";
import { AdminHeader } from "../AdminHeader";
import { AdminSidebar } from "../AdminSidebar";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="min-w-0">
        <AdminHeader onMenuClick={openSidebar}/>
        <AdminContent>{children}</AdminContent>
      </div>
    </div>
  );
};
