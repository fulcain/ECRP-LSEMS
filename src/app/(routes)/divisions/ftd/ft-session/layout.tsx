import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FT Sessions",
  description: "Field training session reports, employee progress, and monthly activity",
};

export default function FtSessionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
