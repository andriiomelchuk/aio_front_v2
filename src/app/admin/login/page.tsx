import { Suspense } from "react";
import { StaffLoginForm } from "@/features/auth";

export default function AdminLoginPage() {
  return <Suspense fallback={null}><StaffLoginForm /></Suspense>;
}
