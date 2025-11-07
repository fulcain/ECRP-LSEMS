import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECRP LSEMS | Communication Update Form",
  description: "Communication Update Form",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
