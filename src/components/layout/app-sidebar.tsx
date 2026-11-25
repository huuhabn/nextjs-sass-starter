'use client';
import { useSyncExternalStore, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { startThemeTransition } from '@/lib/theme-transition';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navGroups } from '@/config/nav-config';
import { authClient } from '@/lib/auth-client';
import { useWorkspace } from '@/lib/workspace-context';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { languages } from '@/i18n/languages';
import { getSavedLocale, setLocale } from '@/i18n/client';
import { switchLocalePath } from '@/i18n/locale';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';

// Nav styling lives here so ui/sidebar.tsx stays identical to upstream.
// Active = soft pill + medium weight + primary-coloured icon; hover is a lighter pill.
const itemClass =
  'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent [&>svg]:text-sidebar-foreground/60 data-active:[&>svg:first-child]:text-sidebar-primary';
// A parent whose child is the current page gets weight + icon colour, but not the pill:
// only the actual page is highlighted, so there's one pill per screen.
const branchActiveClass =
  'font-medium text-sidebar-foreground [&>svg:first-child]:text-sidebar-primary';
const subItemClass =
  'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent';
// 4px horizontal padding on the icon rail lets 32px buttons fit the 2.375rem rail
const railPadding = 'group-data-[collapsible=icon]:px-1';

export default function AppSidebar() {
  const pathname = usePathname();
  const filteredGroups = useFilteredNavGroups(navGroups);

  return (
    <Sidebar collapsible='icon' variant='inset'>
      <SidebarHeader className={railPadding}>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className={railPadding}>
            {group.label && (
              // The rail hides labels by pulling them up over the previous group's last item
              // (-mt-8 + opacity-0); without pointer-events-none they swallow its clicks
              <SidebarGroupLabel className='group-data-[collapsible=icon]:pointer-events-none'>
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarMenu className='gap-0.5'>
              {group.items.map((item) => (
                <NavMainItem key={item.title} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className={railPadding}>
        <NavUser />
      </SidebarFooter>
      <SidebarRail className='hover:after:bg-transparent' />
    </Sidebar>
  );
}

function isActivePath(pathname: string, url: string) {
  return pathname === url || (url !== '/' && url !== '#' && pathname.startsWith(`${url}/`));
}

function NavMainItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
  const children = item.items ?? [];
  const closeMobile = () => setOpenMobile(false);

  if (children.length === 0) {
    const active = isActivePath(pathname, item.url);
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={
            <Link
              href={item.url}
              aria-label={item.title}
              aria-current={active ? 'page' : undefined}
            />
          }
          tooltip={item.title}
          isActive={active}
          className={itemClass}
          onClick={closeMobile}
        >
          <Icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const hasActiveChild = children.some((child) => isActivePath(pathname, child.url));

  // The icon rail hides sub-items, so a group opens its links in a menu to the right instead
  if (state === 'collapsed' && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                tooltip={item.title}
                isActive={hasActiveChild}
                className={cn(
                  itemClass,
                  'data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
                )}
              />
            }
          >
            <Icon />
            <span>{item.title}</span>
          </DropdownMenuTrigger>
          {/* sideOffset 16 clears the rail's own padding so the menu doesn't touch the panel */}
          <DropdownMenuContent
            side='right'
            align='start'
            sideOffset={16}
            className='w-auto min-w-56 p-0 shadow-lg'
          >
            <DropdownMenuGroup className='border-b px-2.5 py-2'>
              <DropdownMenuLabel className='text-foreground flex items-center gap-2 p-0 text-sm'>
                <Icon className='text-muted-foreground size-4' />
                {item.title}
                <span className='text-muted-foreground ml-auto text-xs font-normal tabular-nums'>
                  {children.length}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuGroup className='max-h-96 overflow-y-auto p-1'>
              {children.map((child) => {
                const ChildIcon = child.icon ? Icons[child.icon] : null;
                const active = isActivePath(pathname, child.url);
                return (
                  <DropdownMenuItem
                    key={child.title}
                    render={
                      <Link
                        href={child.url}
                        aria-label={child.title}
                        aria-current={active ? 'page' : undefined}
                      />
                    }
                    className={cn(
                      '[&_svg]:text-muted-foreground',
                      active && 'bg-accent text-accent-foreground font-medium'
                    )}
                  >
                    {ChildIcon && <ChildIcon />}
                    {child.title}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  const branchActive = hasActiveChild && !isActivePath(pathname, item.url);

  return (
    <Collapsible defaultOpen={item.isActive || hasActiveChild} render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActivePath(pathname, item.url)}
            className={cn('group/collapsible', itemClass, branchActive && branchActiveClass)}
          />
        }
      >
        {item.icon && <Icon />}
        <span>{item.title}</span>
        <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-panel-open/collapsible:rotate-90' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className='gap-0.5 py-1'>
          {children.map((child) => {
            const active = isActivePath(pathname, child.url);
            return (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton
                  render={
                    <Link
                      href={child.url}
                      aria-label={child.title}
                      aria-current={active ? 'page' : undefined}
                    />
                  }
                  isActive={active}
                  className={subItemClass}
                  onClick={closeMobile}
                >
                  <span>{child.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavUser() {
  const { data: session } = authClient.useSession();
  const { activeWorkspace } = useWorkspace();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, state } = useSidebar();
  const railMenu = state === 'collapsed' && !isMobile;
  const [isPending, startTransition] = useTransition();
  const { t, i18n } = useTranslation(['nav', 'common']);
  const { setTheme, resolvedTheme } = useTheme();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isDark = mounted && resolvedTheme === 'dark';

  const handleThemeToggle = (e?: React.MouseEvent) => {
    const newMode = isDark ? 'light' : 'dark';
    startThemeTransition(() => setTheme(newMode), e);
  };

  const activeLocale = i18n.language || getSavedLocale();
  const currentLang = languages.find((l) => l.value === activeLocale);

  const handleLocaleChange = (locale: string) => {
    startTransition(async () => {
      await setLocale(locale);
      const targetUrl = switchLocalePath(pathname, locale);
      router.push(targetUrl);
      router.refresh();
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/sign-in');
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
              />
            }
          >
            {user && <UserAvatarProfile className='size-8 rounded-lg' showInfo user={user} />}
            <Icons.chevronsUpDown className='text-muted-foreground ml-auto size-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={isMobile ? 'w-(--anchor-width) min-w-60' : 'w-64'}
            side={isMobile ? 'top' : 'right'}
            align={isMobile ? 'start' : 'end'}
            sideOffset={isMobile ? 4 : railMenu ? 16 : 8}
            alignOffset={isMobile ? 0 : -8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-foreground px-1.5 py-1.5 font-normal'>
                {user && <UserAvatarProfile className='size-8 rounded-lg' showInfo user={user} />}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <Icons.account />
                Profile
              </DropdownMenuItem>
              {activeWorkspace && (
                <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                  <Icons.creditCard />
                  Billing
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
                <Icons.notification />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={isPending} className='cursor-pointer'>
                  <Icons.globe className='size-4' />
                  <span>{t('language', 'Language')}</span>
                  <span className='text-muted-foreground ml-auto text-xs'>
                    {currentLang?.name ?? activeLocale}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  side={isMobile ? 'bottom' : 'right'}
                  align='start'
                  className='min-w-36'
                >
                  <DropdownMenuRadioGroup value={activeLocale} onValueChange={handleLocaleChange}>
                    {languages
                      .filter((l) => l.supported)
                      .map((lang) => (
                        <DropdownMenuRadioItem
                          key={lang.value}
                          value={lang.value}
                          className='cursor-pointer'
                        >
                          {lang.name}
                        </DropdownMenuRadioItem>
                      ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                closeOnClick={false}
                className='cursor-pointer justify-between'
                onClick={(e) => {
                  handleThemeToggle(e);
                }}
              >
                <div className='flex items-center gap-2'>
                  {isDark ? <Icons.moon className='size-4' /> : <Icons.sun className='size-4' />}
                  <span>{t('theme.dark', { ns: 'common', defaultValue: 'Dark Mode' })}</span>
                </div>
                <Switch
                  size='sm'
                  checked={isDark}
                  onCheckedChange={() => handleThemeToggle()}
                  onClick={(e) => e.stopPropagation()}
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleSignOut}>
                <Icons.logout aria-hidden />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
