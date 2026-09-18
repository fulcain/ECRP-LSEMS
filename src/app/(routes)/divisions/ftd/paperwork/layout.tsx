import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paperwork",
  description: "LSEMS paperwork workspace",
};

export default function PaperworkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
