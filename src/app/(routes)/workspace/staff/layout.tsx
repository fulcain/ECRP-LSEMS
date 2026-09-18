import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Page",
  description:
    "Save your signature once, and see the name, rank and director role Discord resolves for you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
