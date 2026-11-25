import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Suspense } from 'react';
import { AreaGraph } from '@/features/overview/components/area-graph';
import { AreaGraphSkeleton } from '@/features/overview/components/area-graph-skeleton';
import { BarGraph } from '@/features/overview/components/bar-graph';
import { BarGraphSkeleton } from '@/features/overview/components/bar-graph-skeleton';
import { PieGraph } from '@/features/overview/components/pie-graph';
import { PieGraphSkeleton } from '@/features/overview/components/pie-graph-skeleton';
import { RecentSales } from '@/features/overview/components/recent-sales';
import { RecentSalesSkeleton } from '@/features/overview/components/recent-sales-skeleton';
import { delay } from '@/const/mock-api';
import { requireAuth } from '@/lib/auth-server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard : Overview'
};

async function AreaStats() {
  await delay(2000);
  return <AreaGraph />;
}

async function BarStats() {
  await delay(1000);
  return <BarGraph />;
}

async function PieStats() {
  await delay(1000);
  return <PieGraph />;
}

async function SalesStats() {
  await delay(3000);
  return <RecentSales />;
}

export default async function OverviewPage() {
  await requireAuth();

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Hi, Welcome back 👋</h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                $1,250.00
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Trending up this month <Icons.trendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>Visitors for the last 6 months</div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>New Customers</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                1,234
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingDown />
                  -20%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Down 20% this period <Icons.trendingDown className='size-4' />
              </div>
              <div className='text-muted-foreground'>Acquisition needs attention</div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Active Accounts</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                45,678
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Strong user retention <Icons.trendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>Engagement exceed targets</div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Growth Rate</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                4.5%
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp />
                  +4.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Steady performance increase <Icons.trendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>Meets growth projections</div>
            </CardFooter>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>
            <Suspense fallback={<AreaGraphSkeleton />}>
              <AreaStats />
            </Suspense>
          </div>
          <div className='col-span-4 md:col-span-3'>
            <Suspense fallback={<RecentSalesSkeleton />}>
              <SalesStats />
            </Suspense>
          </div>
          <div className='col-span-4'>
            <Suspense fallback={<BarGraphSkeleton />}>
              <BarStats />
            </Suspense>
          </div>
          <div className='col-span-4 min-h-0 md:col-span-3'>
            <Suspense fallback={<PieGraphSkeleton />}>
              <PieStats />
            </Suspense>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
