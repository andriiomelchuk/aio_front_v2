import { AppLayout } from "@/widgets/Layout";

export default function SiteLayout({children}: {children: React.ReactNode}) {
    return (
        <AppLayout>{children}</AppLayout>
    );
    
}