import type { Metadata } from "next";
import { ServicesCatalog } from "@/components/Services";

export const metadata: Metadata = { title: "Services", description: "Browse available services and book an appointment.", alternates: { canonical: "/services" } };
export default function ServicesPage() { return <ServicesCatalog />; }
