'use client';

import { useTransition } from 'react';
import { IconWorld } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { languages } from '@/i18n/languages';
import { setLocaleAction } from '@/i18n/actions';

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(locale: string) {
    startTransition(async () => {
      await setLocaleAction(locale);
    });
  }

  const currentLang = languages.find((l) => l.value === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' size='sm' disabled={isPending} aria-label='Change language'>
            <IconWorld className='size-4' />
            <span className='hidden sm:inline ml-1'>{currentLang?.name ?? currentLocale}</span>
          </Button>
        }
      />
      <DropdownMenuContent align='end'>
        <DropdownMenuRadioGroup value={currentLocale} onValueChange={handleLocaleChange}>
          {languages
            .filter((l) => l.supported)
            .map((lang) => (
              <DropdownMenuRadioItem key={lang.value} value={lang.value}>
                {lang.name}
              </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
