'use client';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/client';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';
import { WorkspaceProvider } from '@/lib/workspace-context';

export default function Providers({
  activeThemeValue,
  locale,
  children
}: {
  activeThemeValue: string;
  locale?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <WorkspaceProvider>
          <QueryProvider>{children}</QueryProvider>
        </WorkspaceProvider>
      </ActiveThemeProvider>
    </I18nextProvider>
  );
}
