import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Scale, Shield, Users, Clock } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
      {/* Navigation */}
      <div className="container mx-auto max-w-4xl pt-8 mb-12 px-4">
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
      <div className="container mx-auto max-w-4xl text-center mb-16 px-4">
        <div className="space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Terms of Service
          </h1>
          <p className="text-lg text-black/70">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 pb-16">
        <div className="space-y-8">
          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Users className="h-5 w-5 text-primary" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                By accessing and using BrandLens (&quot;the Service&quot;), you
                accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your use of
                our website located at brandlens.com and our AI brand monitoring
                service operated by BrandLens Inc.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Shield className="h-5 w-5 text-primary" />
                Use License
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                Permission is granted to temporarily download one copy of
                BrandLens materials for personal, non-commercial transitory
                viewing only. This is the grant of a license, not a transfer of
                title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>
                  use the materials for any commercial purpose or for any public
                  display
                </li>
                <li>
                  attempt to reverse engineer any software contained on the
                  website
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials
                </li>
              </ul>
              <p>
                This license shall automatically terminate if you violate any of
                these restrictions and may be terminated by BrandLens at any
                time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                BrandLens provides AI brand monitoring services that track
                mentions of your brand across various AI platforms including but
                not limited to ChatGPT, Claude, and other AI conversation
                systems.
              </p>
              <p>Our service includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Brand mention tracking across AI platforms</li>
                <li>Sentiment analysis of brand mentions</li>
                <li>Competitor analysis and reporting</li>
                <li>Weekly and daily reporting options</li>
                <li>API access for enterprise customers</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                When you create an account with us, you must provide information
                that is accurate, complete, and current at all times. You are
                responsible for safeguarding the password and for all activities
                that occur under your account.
              </p>
              <p>
                You agree not to disclose your password to any third party. You
                must notify us immediately upon becoming aware of any breach of
                security or unauthorized use of your account.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                Our service is provided on a subscription basis. All fees are
                non-refundable except as required by law or as specifically
                permitted in these Terms.
              </p>
              <p>
                We offer a 7-day free trial for new users. After the trial
                period, your subscription will automatically renew and you will
                be charged the applicable subscription fee.
              </p>
              <p>
                You may cancel your subscription at any time through your
                account settings. Cancellation will take effect at the end of
                your current billing period.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                Your privacy is important to us. Please review our Privacy
                Policy, which also governs your use of the Service, to
                understand our practices.
              </p>
              <p>
                <Link
                  href="/privacy-policy"
                  className="text-primary hover:underline"
                >
                  View our Privacy Policy
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>You may not use our service:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  For any unlawful purpose or to solicit others to engage in
                  unlawful acts
                </li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations, rules, laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights
                  or the intellectual property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage,
                  intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
                <li>
                  To upload or transmit viruses or any other type of malicious
                  code
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Service Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>BrandLens reserves the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or discontinue the service at any time</li>
                <li>Refuse service to anyone for any reason</li>
                <li>
                  Impose limits on certain features or restrict access to parts
                  of the service
                </li>
                <li>Update these terms at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Clock className="h-5 w-5 text-primary" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will try to provide at least 30 days notice prior to any new
                terms taking effect.
              </p>
              <p>
                What constitutes a material change will be determined at our
                sole discretion. By continuing to access or use our Service
                after those revisions become effective, you agree to be bound by
                the revised terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="font-semibold text-black">BrandLens Inc.</p>
                <p>Email: legal@brandlens.com</p>
                <p>Address: 123 Business Street, San Francisco, CA 94105</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
