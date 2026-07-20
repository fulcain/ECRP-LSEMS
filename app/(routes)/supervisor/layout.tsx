import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECRP LSEMS | Supervisor Tools",
  description: "Supervisor tools for LOA processing and management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
