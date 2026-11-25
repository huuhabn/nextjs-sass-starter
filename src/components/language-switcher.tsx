'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { languages } from '@/i18n/languages';
import { getSavedLocale, setLocale } from '@/i18n/client';
import { switchLocalePath } from '@/i18n/locale';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  currentLocale?: string;
  className?: string;
}

export function LanguageSwitcher({ currentLocale, className }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const activeLocale = currentLocale || i18n.language || getSavedLocale();
  const currentLang = languages.find((l) => l.value === activeLocale);

  function handleLocaleChange(locale: string) {
    startTransition(async () => {
      await setLocale(locale);
      const targetUrl = switchLocalePath(pathname, locale);
      router.push(targetUrl);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            size='sm'
            disabled={isPending}
            aria-label='Change language'
            className={cn(
              'h-8 justify-between gap-1.5 rounded-lg border-input bg-transparent px-2.5 text-sm font-normal shadow-none transition-colors hover:bg-accent dark:bg-input/30 dark:hover:bg-input/50',
              className
            )}
          >
            <span className='flex items-center gap-1.5'>
              <Icons.globe className='text-muted-foreground size-4' />
              <span className='hidden sm:inline'>{currentLang?.name ?? activeLocale}</span>
            </span>
            <Icons.chevronDown className='text-muted-foreground size-3.5 opacity-60' />
          </Button>
        }
      />
      <DropdownMenuContent align='end'>
        <DropdownMenuRadioGroup value={activeLocale} onValueChange={handleLocaleChange}>
          {languages
            .filter((l) => l.supported)
            .map((lang) => (
              <DropdownMenuRadioItem key={lang.value} value={lang.value} className='cursor-pointer'>
                {lang.name}
              </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
