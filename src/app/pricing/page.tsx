'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  ArrowLeft,
  Loader2,
  Star,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import { pricingTiers } from '@/lib/stripe';
import { toast } from 'sonner';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const session = await response.json();

      if (session.user) {
        setIsAuthenticated(true);

        // Get user's organization
        const orgsResponse = await fetch('/api/organizations');
        const orgs = await orgsResponse.json();

        if (orgs.length > 0) {
          setOrganizationId(orgs[0].id);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleSelectPlan = async (priceId: string, planKey: string) => {
    if (!isAuthenticated) {
      // Redirect to signup with selected plan
      router.push(`/signup?plan=${planKey}`);
      return;
    }

    if (!organizationId) {
      toast.error('Please complete onboarding first');
      router.push('/onboarding');
      return;
    }

    setLoading(true);
    setSelectedPlan(planKey);

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
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout'
      );
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const features = {
    starter: [
      '100 queries per month',
      '5 competitor tracking',
      'Weekly email reports',
      'Basic sentiment analysis',
      '50+ pre-built query templates',
      'Email support',
      '7-day free trial',
    ],
    growth: [
      'Everything in Starter, plus:',
      '500 queries per month',
      '15 competitor tracking',
      'Daily email reports',
      'Advanced sentiment analysis',
      'Custom query templates',
      'API access',
      'Priority support',
      'Slack integration',
    ],
    scale: [
      'Everything in Growth, plus:',
      'Unlimited queries',
      'Unlimited competitors',
      'Real-time alerts',
      'Enterprise sentiment analysis',
      'Custom integrations',
      'White-label options',
      'Advanced analytics',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
      {/* Navigation */}
      <div className="container mx-auto max-w-6xl pt-8 mb-12 px-4">
        <Link href="/">
          <Button
            variant="ghost"
            className="gap-2 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="container mx-auto max-w-6xl text-center mb-16 px-4">
        <div className="space-y-6">
          <Badge variant="secondary" className="px-4 py-2">
            <Star className="h-3 w-3 mr-1 inline" />
            7-Day Free Trial
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-black animate-fadeIn">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl text-black/80 max-w-3xl mx-auto leading-relaxed">
            Track your brand mentions across AI platforms. Start with a 7-day
            free trial, no credit card required.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          {Object.entries(pricingTiers).map(([key, tier], index) => {
            const isPopular = key === 'growth';
            const icons = {
              starter: Users,
              growth: Zap,
              scale: Shield,
            };
            const IconComponent = icons[key as keyof typeof icons];

            return (
              <Card
                key={key}
                className={`relative group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur ${
                  isPopular
                    ? 'transform scale-105 border-2 border-primary shadow-xl'
                    : 'hover:shadow-xl'
                } animate-slideUp`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-4 py-1.5 shadow-lg bg-gradient-to-r from-primary to-blue-600">
                      <Star className="h-3 w-3 mr-1 inline" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl mb-2 text-black">
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="text-black/70 mb-6 text-lg">
                    {tier.description}
                  </CardDescription>
                  <div className="mb-6">
                    <span
                      className={`text-6xl font-bold ${isPopular ? 'text-primary' : 'text-black'}`}
                    >
                      ${tier.price}
                    </span>
                    <span className="text-black/60 text-lg">/month</span>
                  </div>
                  <Button
                    onClick={() => handleSelectPlan(tier.priceId, key)}
                    disabled={loading}
                    size="lg"
                    className="w-full shadow-md hover:shadow-lg transition-all duration-300 py-3"
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {loading && selectedPlan === key ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isAuthenticated ? (
                      'Start Free Trial'
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <ul className="space-y-4">
                    {features[key as keyof typeof features].map(
                      (feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-black/80 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="container mx-auto max-w-5xl mt-24 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-black/70">
            Everything you need to know about our pricing and features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur">
            <h3 className="text-xl font-semibold mb-3 text-black">
              How does the free trial work?
            </h3>
            <p className="text-black/80 leading-relaxed">
              All plans come with a 7-day free trial. No credit card required to
              start. You&apos;ll only be charged after the trial ends if you
              choose to continue.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur">
            <h3 className="text-xl font-semibold mb-3 text-black">
              What counts as a query?
            </h3>
            <p className="text-black/80 leading-relaxed">
              Each time you run a brand analysis query against an AI platform
              (ChatGPT, Claude, etc.), it counts as one query. You can run the
              same query multiple times to track changes over time.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur">
            <h3 className="text-xl font-semibold mb-3 text-black">
              Can I change plans later?
            </h3>
            <p className="text-black/80 leading-relaxed">
              Yes! You can upgrade, downgrade, or cancel your plan at any time.
              Changes take effect immediately and we&apos;ll prorate any
              differences.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur">
            <h3 className="text-xl font-semibold mb-3 text-black">
              Do you offer annual billing?
            </h3>
            <p className="text-black/80 leading-relaxed">
              Yes, annual billing is available with a 20% discount. Contact our
              sales team for annual pricing options.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto max-w-4xl mt-24 mb-16 text-center px-4">
        <Card className="p-12 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border-0 shadow-xl">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              Ready to track your brand in AI?
            </h2>
            <p className="text-lg text-black/80 max-w-2xl mx-auto">
              Join companies already monitoring their AI visibility. Start your
              free trial today and see how your brand appears in AI
              conversations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Link href="/dashboard/billing">
                  <Button
                    size="lg"
                    className="shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    View Plans
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="text-sm text-black/60 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                7-day free trial
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                No credit card required
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
