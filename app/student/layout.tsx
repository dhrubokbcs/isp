'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import StudentAppShell from '@/components/student/StudentAppShell';
import { ToastProvider } from '@/components/common/ToastProvider';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/student/login';

  return (
    <ToastProvider>
      {isLoginPage ? children : <StudentAppShell>{children}</StudentAppShell>}
    </ToastProvider>
  );
}
