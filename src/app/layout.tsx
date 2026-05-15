import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리 반 방명록",
  description: "학과 동기들과 소통하는 실시간 방명록",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
