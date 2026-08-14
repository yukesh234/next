import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Narrative | Modern Blog Platform",
  description: "Discover stories, thinking, and expertise from writers on any topic.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2">
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent transition-all group-hover:from-indigo-500 group-hover:to-violet-500">
                  Narrative
                </span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-500/10">
                  Blog
                </span>
              </Link>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/admin"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 hover:shadow transition-all"
              >
                Admin Panel
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Narrative Blog. All rights reserved. Built with Next.js, Mongoose, and Tailwind CSS.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
