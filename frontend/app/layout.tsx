import { MainLayoutWrapper, Providers } from "@/components/provider";
import "./globals.css";

export const metadata = {
  title: "JobConnect",
  description:
    "AI-powered job platform helping candidates find their dream jobs and employers find the perfect talent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <Providers>
            <MainLayoutWrapper>{children}</MainLayoutWrapper>
          </Providers>
        </body>
      </html>
    </>
  );
}
