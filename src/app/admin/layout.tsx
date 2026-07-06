import { AdminLayout } from "@/widgets/AdminWidgets";





export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}