import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Generate ready-to-post templates for the government website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
