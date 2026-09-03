'use client';

import * as React from 'react';
import TeacherSettingsPage from '@/app/console/teacher/settings/page';
import ConsoleAppShell from '@/components/console/ConsoleAppShell';
import { ToastProvider } from '@/components/common/ToastProvider';

export default function RootTeacherSettingsPage() {
  return (
    <ToastProvider>
      <ConsoleAppShell>
        <TeacherSettingsPage />
      </ConsoleAppShell>
    </ToastProvider>
  );
}
