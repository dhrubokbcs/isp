'use client';

import * as React from 'react';
import StudentAppShell from '@/components/student/StudentAppShell';
import { ToastProvider } from '@/components/common/ToastProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <StudentAppShell>{children}</StudentAppShell>
    </ToastProvider>
  );
}
