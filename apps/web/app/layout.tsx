import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'DevLearn — Personal Learning Progress Platform',
  description: 'Track what you learn. Measure your time. See your progress.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-neutral-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
