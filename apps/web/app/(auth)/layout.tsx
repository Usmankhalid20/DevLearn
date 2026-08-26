import * as React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center space-x-2 font-mono font-bold text-white tracking-wider mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black text-xs font-black">
              DL
            </div>
            <span className="text-lg">DevLearn</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
