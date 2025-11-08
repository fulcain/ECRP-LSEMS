import "./global.css"
import { MedicProvider } from "@/app/context/MedicContext";
import { Header } from "@/components/layout/header/header";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "ECRP LSEMS",
  description: "Application for ECRP LSEMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MedicProvider>
            <Header />
            {children}
          </MedicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
