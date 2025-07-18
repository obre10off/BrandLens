'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { pricingTiers } from '@/lib/stripe';
import { useSession } from '@/lib/auth/client';

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [trialInfo, setTrialInfo] = useState<{
    status: string;
    queriesUsed: number;
    queriesLimit: number;
  } | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  // Check for success/cancel params
  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success('Subscription activated successfully!');
      router.replace('/dashboard/billing');
    } else if (searchParams.get('canceled')) {
      toast.error('Subscription canceled');
      router.replace('/dashboard/billing');
    }
  }, [searchParams, router]);

  // Fetch current subscription status
  useEffect(() => {
    if (session?.user) {
      fetchBillingInfo();
    } else {
      setLoadingOrgs(false);
    }
  }, [session]);

  const fetchBillingInfo = async () => {
    try {
      setLoadingOrgs(true);
      
      // Get user's organization info
      const orgsResponse = await fetch('/api/organizations');
      if (!orgsResponse.ok) {
        throw new Error('Failed to fetch organizations');
      }
      
      const orgs = await orgsResponse.json();
      
      if (orgs.length > 0) {
        const org = orgs[0];
        setOrganizationId(org.id);
        
        if (org.subscription?.status === 'active') {
          setCurrentPlan(org.subscription.plan);
        } else if (org.trial?.status === 'active') {
          setTrialInfo({
            status: org.trial.status,
            queriesUsed: org.trial.queriesUsed || 0,
            queriesLimit: org.trial.queriesLimit,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleCheckout = async (priceId: string) => {
    if (!organizationId) {
      toast.error('No organization found');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          organizationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Checkout failed');
      }

      const { checkoutUrl } = await response.json();
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!organizationId) {
      toast.error('No organization found');
      return;
    }

    setLoadingPortal(true);
    try {
      const response = await fetch(`/api/stripe/checkout?organizationId=${organizationId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to access billing portal');
      }

      const { portalUrl } = await response.json();
      
      if (portalUrl) {
        window.location.href = portalUrl;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to access billing portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  const features = {
    starter: [
      '100 queries per month',
      '5 competitor tracking',
      'Weekly email reports',
      'Basic sentiment analysis',
      'Email support',
    ],
    growth: [
      '500 queries per month',
      '15 competitor tracking',
      'Daily email reports',
      'Advanced sentiment analysis',
      'Priority support',
      'Custom query templates',
      'API access',
    ],
    scale: [
      'Unlimited queries',
      'Unlimited competitors',
      'Real-time alerts',
      'Enterprise sentiment analysis',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
      'Advanced analytics',
    ],
  };

  if (!session) {
    return null;
  }

  if (loadingOrgs) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-black">Billing & Subscription</h1>
        <p className="text-black">
          Manage your subscription and billing settings
        </p>
      </div>

      {/* Trial Status Alert */}
      {trialInfo && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-black">
            <strong>Free Trial Active:</strong> You&apos;ve used {trialInfo.queriesUsed} of {trialInfo.queriesLimit} queries.
            {trialInfo.queriesUsed >= trialInfo.queriesLimit * 0.8 && (
              <span className="block mt-1">
                You&apos;re running low on trial queries. Upgrade now to continue tracking your brand.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Current Plan</CardTitle>
            <CardDescription className="text-black">
              You&apos;re currently on the {currentPlan} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold capitalize text-black">
                  {currentPlan} Plan
                </h3>
                <p className="text-sm text-black">
                  ${pricingTiers[currentPlan as keyof typeof pricingTiers].price}/month
                </p>
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                variant="outline"
              >
                {loadingPortal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(pricingTiers).map(([key, tier]) => {
          const isCurrentPlan = currentPlan === key;
          const isUpgrade = currentPlan && 
            ['starter', 'growth'].indexOf(currentPlan) < ['starter', 'growth', 'scale'].indexOf(key);

          return (
            <Card 
              key={key} 
              className={isCurrentPlan ? 'border-primary' : ''}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-black">{tier.name}</CardTitle>
                  {isCurrentPlan && (
                    <Badge variant="default">Current Plan</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold text-black">${tier.price}</span>
                  <span className="text-black">/month</span>
                </div>

                <ul className="space-y-2 text-sm">
                  {features[key as keyof typeof features].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-black">{feature}</span>
                    </li>
                  ))}
                </ul>

                {!currentPlan || isUpgrade ? (
                  <Button
                    onClick={() => handleCheckout(tier.priceId)}
                    disabled={loading}
                    className="w-full"
                    variant={isUpgrade ? 'default' : 'outline'}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isUpgrade ? (
                      'Upgrade Plan'
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                ) : isCurrentPlan ? (
                  <Button variant="secondary" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Downgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-black">Can I change plans anytime?</h4>
            <p className="text-sm text-black mt-1">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-black">What happens to my data if I cancel?</h4>
            <p className="text-sm text-black mt-1">
              Your data is retained for 30 days after cancellation. You can reactivate anytime within this period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-black">Do you offer refunds?</h4>
            <p className="text-sm text-black mt-1">
              We offer a 7-day money-back guarantee for all new subscriptions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}