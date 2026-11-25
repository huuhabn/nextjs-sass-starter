'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWorkspace } from '@/lib/workspace-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ExclusiveView() {
  const { activeWorkspace } = useWorkspace();
  const isPro = activeWorkspace?.plan === 'pro' || activeWorkspace?.plan === 'enterprise';

  if (!isPro) {
    return (
      <PageContainer>
        <div className='flex min-h-[400px] items-center justify-center'>
          <Alert className='max-w-md'>
            <Icons.lock className='h-5 w-5 text-yellow-600' />
            <AlertDescription>
              <div className='mb-1 text-lg font-semibold'>Pro Plan Required</div>
              <div className='text-muted-foreground'>
                This exclusive area is only available to organizations on the{' '}
                <span className='font-semibold'>Pro</span> or{' '}
                <span className='font-semibold'>Enterprise</span> plan.
                <br />
                <br />
                <Button size='sm' render={<Link href='/dashboard/billing'>Upgrade Plan</Link>} />
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <Icons.badgeCheck className='h-7 w-7 text-green-600' />
            Exclusive Area
          </h1>
          <p className='text-muted-foreground'>
            Welcome, <span className='font-semibold'>{activeWorkspace?.name}</span>! This page
            contains exclusive features unlocked for Pro organizations.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icons.sparkles className='size-5 text-primary' />
                Advanced AI Reasoning
              </CardTitle>
              <CardDescription>
                Full access to Gemini 2.5 Pro and deep thinking streaming pipelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Enjoy unlimited token generation, multi-modal vision inputs, and subagent
                orchestration.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icons.sparkles className='size-5 text-primary' />
                High-Speed Webhooks
              </CardTitle>
              <CardDescription>
                Real-time event streaming with guaranteed delivery and retry policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Process millions of webhook deliveries per day with sub-millisecond latencies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icons.lock className='size-5 text-primary' />
                Enterprise Security
              </CardTitle>
              <CardDescription>
                Advanced RBAC, 2FA enforcement, and tamper-evident audit trails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Rest easy knowing your organizational data is guarded by military-grade encryption.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
