'use client';

import * as React from 'react';
import TeacherDashboardPage from '@/app/console/teacher/dashboard/page';
import ConsoleAppShell from '@/components/console/ConsoleAppShell';
import { ToastProvider } from '@/components/common/ToastProvider';

export default function RootTeacherDashboardPage() {
  return (
    <ToastProvider>
      <ConsoleAppShell>
        <TeacherDashboardPage />
      </ConsoleAppShell>
    </ToastProvider>
  );
}
