'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { billingInfoContent } from '@/config/infoconfig';
import { useWorkspace } from '@/lib/workspace-context';
import { toast } from 'sonner';

interface PlanTier {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const PLANS: PlanTier[] = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    period: 'forever',
    description: 'Perfect for small teams and prototyping.',
    features: [
      'Up to 3 team members',
      '1,000 API requests/day',
      'Community support',
      'Basic analytics'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For growing businesses and production apps.',
    features: [
      'Unlimited team members',
      '100,000 API requests/day',
      'Priority email & chat support',
      'Advanced analytics & exports',
      'Exclusive Pro features',
      '99.9% Uptime SLA'
    ],
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    description: 'Advanced security, compliance, and dedicated support.',
    features: [
      'Unlimited everything',
      'Custom API rate limits',
      'Dedicated account manager',
      'SSO & SAML integration',
      'Custom contracts & invoicing',
      'Audit logs & SOC2 compliance'
    ]
  }
];

export default function BillingView() {
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  const currentPlan = activeWorkspace?.plan || 'pro';

  const handleSelectPlan = (plan: 'free' | 'pro' | 'enterprise') => {
    if (activeWorkspace) {
      setActiveWorkspace({
        ...activeWorkspace,
        plan
      });
      toast.success(`Subscription updated to ${plan.toUpperCase()}`);
    }
  };

  return (
    <PageContainer
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription={`Manage subscription and billing tiers for ${activeWorkspace?.name || 'Workspace'}`}
    >
      <div className='space-y-6'>
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            You are currently on the <strong className='uppercase'>{currentPlan}</strong> plan for{' '}
            <strong>{activeWorkspace?.name}</strong>.
          </AlertDescription>
        </Alert>

        <div className='grid gap-6 md:grid-cols-3'>
          {PLANS.map((tier) => {
            const isCurrent = tier.id === currentPlan;
            return (
              <Card
                key={tier.id}
                className={`relative flex flex-col justify-between ${
                  tier.isPopular ? 'border-primary ring-2 ring-primary/20 shadow-md' : ''
                } ${isCurrent ? 'bg-primary/5 border-primary' : ''}`}
              >
                {tier.isPopular && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                    <Badge variant='default' className='px-3 py-0.5 text-xs font-semibold'>
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className='flex items-center justify-between text-xl'>
                    {tier.name}
                    {isCurrent && (
                      <Badge variant='secondary' className='text-xs'>
                        Current Plan
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className='mt-4 flex items-baseline gap-1'>
                    <span className='text-4xl font-extrabold tracking-tight'>{tier.price}</span>
                    <span className='text-muted-foreground text-sm'>/{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    Included features:
                  </p>
                  <ul className='space-y-2 text-sm'>
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className='flex items-center gap-2'>
                        <Icons.check className='size-4 text-primary shrink-0' />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className='pt-4'>
                  <Button
                    className='w-full'
                    variant={isCurrent ? 'secondary' : tier.isPopular ? 'default' : 'outline'}
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(tier.id)}
                  >
                    {isCurrent ? 'Active Plan' : `Upgrade to ${tier.name}`}
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
