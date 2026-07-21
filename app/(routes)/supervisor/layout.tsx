import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECRP LSEMS | Supervisor Tools",
  description:
    "Supervisor tools for LOA processing, meeting agendas, and contract signings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
