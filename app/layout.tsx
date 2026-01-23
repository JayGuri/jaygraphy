import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // Can use a more "tech" or "clean" font if available, or default
import "./globals.css";
import "@/components/ui/magic-bento.css";
import "@/components/ui/masonry.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import ExposureTriangleLoader from "@/components/ui/exposure-triangle-loader";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jaygraphy | Engineering & Photography",
  description: "Jaygraphy — portfolio of Jay, an engineering student and photographer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ExposureTriangleLoader />
          <Navbar />
          <main className="pt-16 min-h-screen bg-background text-foreground transition-colors duration-300">
            {children}
          </main>
          <footer className="py-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>Built by an engineering student who prefers shooting and shipping over just talking about it.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
