import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A&R",
  description: "Air & Rescue certification and certificate format builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
