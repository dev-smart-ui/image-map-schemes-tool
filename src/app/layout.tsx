import { ReactNode } from "react";
import SessionWrapper from "@/components/SessionWrapper";
import { SchemeMapperContextProvider } from "@/context/SchemeMapperContext";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <SchemeMapperContextProvider>
            {children}
          </SchemeMapperContextProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
