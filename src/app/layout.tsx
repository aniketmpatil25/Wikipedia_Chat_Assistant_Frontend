import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wikipedia Intelligent Chat Assistant',
  description: 'AI-powered RAG chat assistant that answers queries using Wikipedia content with citations and smart routing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#060814] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200"
      >
        {children}
      </body>
    </html>
  );
}
