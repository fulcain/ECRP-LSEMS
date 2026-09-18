import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Log",
  description: "A unified history of updates and improvements to the LSEMS application",
};

export default function ChangeLogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
