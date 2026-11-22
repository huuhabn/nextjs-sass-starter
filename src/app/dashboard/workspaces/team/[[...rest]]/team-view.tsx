'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { teamInfoContent } from '@/config/infoconfig';
import { useWorkspace } from '@/lib/workspace-context';
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'm-1',
    name: 'You',
    email: 'user@example.com',
    role: 'owner',
    joinedAt: '2026-01-15'
  },
  {
    id: 'm-2',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'admin',
    joinedAt: '2026-02-01'
  },
  {
    id: 'm-3',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'member',
    joinedAt: '2026-02-10'
  }
];

export default function TeamView() {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    setIsInviting(false);
    toast.success(`Invitation sent to ${inviteEmail}!`);
  };

  const handleRemove = (id: string, name: string) => {
    setMembers(members.filter((m) => m.id !== id));
    toast.success(`Removed ${name} from team.`);
  };

  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription={`Manage members, roles and invitations for ${activeWorkspace?.name || 'Workspace'}`}
      infoContent={teamInfoContent}
    >
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium'>Team Members ({members.length})</h3>
            <p className='text-muted-foreground text-sm'>
              Collaborate and manage access permissions for this workspace.
            </p>
          </div>
          <Button onClick={() => setIsInviting(!isInviting)}>
            <Icons.add className='mr-2 size-4' />
            {isInviting ? 'Cancel' : 'Invite Member'}
          </Button>
        </div>

        {isInviting && (
          <Card className='border-primary/50'>
            <CardHeader>
              <CardTitle>Invite New Member</CardTitle>
              <CardDescription>
                Send an email invitation to join {activeWorkspace?.name}.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleInvite}>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='invite-email'>Email Address</Label>
                    <Input
                      id='invite-email'
                      type='email'
                      placeholder='colleague@example.com'
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='invite-role'>Role</Label>
                    <select
                      id='invite-role'
                      className='border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm'
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    >
                      <option value='member'>Member (Read & Write)</option>
                      <option value='admin'>Admin (Manage Team & Billing)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => setIsInviting(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Send Invitation</Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <Card>
          <div className='divide-y'>
            {members.map((member) => (
              <div key={member.id} className='flex items-center justify-between p-4'>
                <div className='flex items-center gap-3'>
                  <div className='bg-muted flex size-9 items-center justify-center rounded-full font-semibold text-xs'>
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className='text-sm font-medium leading-none'>{member.name}</p>
                    <p className='text-muted-foreground text-xs'>{member.email}</p>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <Badge
                    variant={
                      member.role === 'owner'
                        ? 'default'
                        : member.role === 'admin'
                          ? 'secondary'
                          : 'outline'
                    }
                    className='capitalize text-xs'
                  >
                    {member.role}
                  </Badge>
                  <span className='text-muted-foreground text-xs hidden sm:inline'>
                    Joined {member.joinedAt}
                  </span>
                  {member.role !== 'owner' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-destructive hover:bg-destructive/10'
                      onClick={() => handleRemove(member.id, member.name)}
                    >
                      <Icons.trash className='size-4' />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
