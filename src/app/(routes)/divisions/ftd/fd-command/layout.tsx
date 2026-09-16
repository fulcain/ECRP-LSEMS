import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LSEMS | FTD Command",
  description: "Field Training Division command workspace",
};

export default function FtdCommandLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
