'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { workspacesInfoContent } from '@/config/infoconfig';
import { useWorkspace, type Workspace } from '@/lib/workspace-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function WorkspacesView() {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspace();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }
    const created = createWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName('');
    setIsCreating(false);
    toast.success(`Workspace "${created.name}" created!`);
  };

  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
      infoContent={workspacesInfoContent}
    >
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium'>Your Workspaces</h3>
            <p className='text-muted-foreground text-sm'>
              Select a workspace to manage its settings, team, and billing.
            </p>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Icons.add className='mr-2 size-4' />
            {isCreating ? 'Cancel' : 'New Workspace'}
          </Button>
        </div>

        {isCreating && (
          <Card className='border-primary/50'>
            <CardHeader>
              <CardTitle>Create New Workspace</CardTitle>
              <CardDescription>
                Create a dedicated workspace for your team or organization.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='workspace-name'>Workspace Name</Label>
                  <Input
                    id='workspace-name'
                    placeholder='e.g., Acme Innovations'
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Create Workspace</Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {workspaces.map((workspace: Workspace) => {
            const isActive = workspace.id === activeWorkspace?.id;
            return (
              <Card
                key={workspace.id}
                className={`relative flex flex-col justify-between transition-all ${
                  isActive
                    ? 'border-primary ring-1 ring-primary shadow-sm'
                    : 'hover:border-foreground/20'
                }`}
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg font-semibold'>
                        {workspace.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className='text-base'>{workspace.name}</CardTitle>
                        <CardDescription className='text-xs'>/{workspace.slug}</CardDescription>
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant='default' className='text-xs'>
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Icons.user className='size-3.5' />
                      <span className='capitalize'>{workspace.role}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Icons.teams className='size-3.5' />
                      <span>{workspace.membersCount} members</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Icons.lock className='size-3.5' />
                      <span className='uppercase font-medium'>{workspace.plan}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='flex gap-2 border-t pt-4'>
                  {!isActive ? (
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={() => {
                        setActiveWorkspace(workspace);
                        toast.success(`Switched to ${workspace.name}`);
                      }}
                    >
                      Switch
                    </Button>
                  ) : (
                    <Button variant='secondary' size='sm' className='flex-1' disabled>
                      Current
                    </Button>
                  )}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => router.push('/dashboard/workspaces/team')}
                  >
                    Manage Team
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
