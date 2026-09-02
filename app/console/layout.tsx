'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import ConsoleAppShell from '@/components/console/ConsoleAppShell';
import { ToastProvider } from '@/components/common/ToastProvider';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Don't render the sidebar/appbar on login pages
  const isLoginPage = pathname === '/console/login' || pathname === '/login' || pathname === '/console' || pathname === '/';

  return (
    <ToastProvider>
      {isLoginPage ? children : <ConsoleAppShell>{children}</ConsoleAppShell>}
    </ToastProvider>
  );
}
