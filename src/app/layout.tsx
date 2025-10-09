import { ReactNode } from "react";
import { SchemeMapperContextProvider } from "@/context/SchemeMapperContext";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
          <SchemeMapperContextProvider>
            {children}
          </SchemeMapperContextProvider>
      </body>
    </html>
  );
}
