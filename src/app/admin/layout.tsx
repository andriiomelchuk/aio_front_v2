import { AdminAccessGuard } from "@/features/auth";





export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAccessGuard>{children}</AdminAccessGuard>
    );
}
