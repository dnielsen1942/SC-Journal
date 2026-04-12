import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "SC Journal - Star Citizen Tracker",
  description:
    "Personal journal, asset tracker, and ledger for Star Citizen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-[Inter,sans-serif]">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              color: "#c5cdd8",
            },
          }}
        />
      </body>
    </html>
  );
}
