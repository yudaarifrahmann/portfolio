import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Admin | Portfolio",
  description: "Atur isi konten portfolio Anda secara realtime.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
