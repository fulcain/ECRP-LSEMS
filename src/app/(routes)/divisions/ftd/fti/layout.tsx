import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LSEMS | FTI",
  description: "Field Training Instructor certification workspace",
};

export default function FtiLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
