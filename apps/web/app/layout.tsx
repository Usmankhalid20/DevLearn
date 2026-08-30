import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'DevLearn — Track What You Learn. Measure Your Time. See Your Progress.',
  description:
    'DevLearn is a personal learning progress platform for students, developers, and self-learners. Turn scattered study hours across videos, docs, and courses into measurable progress and consistency.',
  keywords: [
    'developer learning',
    'study progress tracker',
    'learning contribution graph',
    'developer productivity',
    'time tracking for programmers',
    'self-learning platform',
    'coding study tracker',
  ],
  authors: [{ name: 'DevLearn Team' }],
  openGraph: {
    title: 'DevLearn — Personal Learning Progress Platform',
    description: 'Track what you learn. Measure your time. See your progress.',
    type: 'website',
    url: 'https://devlearn.app',
    siteName: 'DevLearn',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevLearn — Personal Learning Progress Platform',
    description: 'Track what you learn. Measure your time. See your progress.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-base text-foreground antialiased selection:bg-neutral-800 selection:text-white">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <ToastContainer
          theme="dark"
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </body>
    </html>
  );
}
