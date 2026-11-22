'use client';

import { Icons } from '@/components/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWorkspace, type Workspace } from '@/lib/workspace-context';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

export function OrgSwitcher() {
  const { isMobile, state } = useSidebar();
  const railMenu = state === 'collapsed' && !isMobile;
  const router = useRouter();
  const { workspaces, activeWorkspace, setActiveWorkspace, isLoaded } = useWorkspace();

  if (!isLoaded) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg'>
              <Icons.galleryVerticalEnd className='size-4' />
            </div>
            <div
              className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
                state === 'collapsed'
                  ? 'invisible max-w-0 overflow-hidden opacity-0'
                  : 'visible max-w-full opacity-100'
              }`}
            >
              <span className='truncate font-medium'>Loading...</span>
              <span className='text-muted-foreground truncate text-xs'>Workspaces</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const currentWorkspace = activeWorkspace || workspaces[0];

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
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg'>
              {currentWorkspace?.imageUrl ? (
                <Image
                  src={currentWorkspace.imageUrl}
                  alt={currentWorkspace.name}
                  width={32}
                  height={32}
                  className='size-full object-cover'
                />
              ) : (
                <Icons.galleryVerticalEnd className='size-4' />
              )}
            </div>
            <div
              className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
                state === 'collapsed'
                  ? 'invisible max-w-0 overflow-hidden opacity-0'
                  : 'visible max-w-full opacity-100'
              }`}
            >
              <span className='truncate font-medium' title={currentWorkspace?.name}>
                {currentWorkspace?.name || 'Workspace'}
              </span>
              <span className='text-muted-foreground truncate text-xs capitalize'>
                {currentWorkspace?.role || 'Member'}
              </span>
            </div>
            <Icons.chevronsUpDown
              className={`text-muted-foreground ml-auto transition-all duration-200 ease-in-out ${
                state === 'collapsed'
                  ? 'invisible max-w-0 opacity-0'
                  : 'visible max-w-full opacity-100'
              }`}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-72 max-w-[calc(100vw-2rem)]'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={isMobile ? 4 : railMenu ? 16 : 8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {workspaces.map((workspace: Workspace) => {
                const isActive = workspace.id === currentWorkspace?.id;
                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace)}
                    className='items-start gap-2 p-1.5 cursor-pointer'
                  >
                    <div className='flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border'>
                      {workspace.imageUrl ? (
                        <Image
                          src={workspace.imageUrl}
                          alt={workspace.name}
                          width={28}
                          height={28}
                          className='size-full object-cover'
                        />
                      ) : (
                        <Icons.galleryVerticalEnd className='size-3.5 shrink-0' />
                      )}
                    </div>
                    <div className='grid min-w-0 flex-1 leading-tight'>
                      <span className='text-pretty wrap-break-word font-medium'>
                        {workspace.name}
                      </span>
                      <span className='text-muted-foreground text-xs capitalize'>
                        {workspace.role} • {workspace.plan}
                      </span>
                    </div>
                    {isActive && <Icons.check className='mt-1.5 ml-auto size-4 text-primary' />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className='gap-2 p-1.5 cursor-pointer'
                onClick={() => {
                  router.push('/dashboard/workspaces');
                }}
              >
                <div className='flex size-7 items-center justify-center rounded-md border bg-transparent'>
                  <Icons.add className='size-4' />
                </div>
                <div className='text-muted-foreground font-medium'>Manage workspaces</div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
