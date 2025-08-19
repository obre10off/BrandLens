import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Globe,
  UserCheck,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Privacy Policy
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
                <Eye className="h-5 w-5 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                BrandLens Inc. (&quot;we&quot;, &quot;our&quot;, or
                &quot;us&quot;) is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our AI brand monitoring
                service.
              </p>
              <p>
                This policy applies to all information collected through our
                website (brandlens.com), our service, and any related services,
                sales, marketing, or events.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  Personal Information
                </h3>
                <p className="mb-2">
                  We may collect personal information that you provide to us
                  such as:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Name and contact information (email address, phone number)
                  </li>
                  <li>Company information and job title</li>
                  <li>Billing and payment information</li>
                  <li>Account credentials and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Usage Information
                </h3>
                <p className="mb-2">
                  We automatically collect information about your use of our
                  service:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Log data (IP address, browser type, pages visited)</li>
                  <li>Device information (device type, operating system)</li>
                  <li>Analytics data (usage patterns, feature interactions)</li>
                  <li>Brand monitoring queries and results</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Provide, maintain, and improve our AI brand monitoring service
                </li>
                <li>Process transactions and send transaction notifications</li>
                <li>
                  Send you technical notices, updates, and support messages
                </li>
                <li>
                  Respond to your comments, questions, and customer service
                  requests
                </li>
                <li>
                  Monitor and analyze trends, usage, and activities in
                  connection with our service
                </li>
                <li>
                  Detect, investigate, and prevent fraudulent transactions and
                  other illegal activities
                </li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Globe className="h-5 w-5 text-primary" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties except in the following
                circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Service Providers:</strong> We may share information
                  with trusted third-party service providers who assist us in
                  operating our service
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose
                  information if required by law or in response to valid
                  requests by public authorities
                </li>
                <li>
                  <strong>Business Transfers:</strong> Information may be
                  transferred in connection with a merger, acquisition, or asset
                  sale
                </li>
                <li>
                  <strong>Consent:</strong> We may share information with your
                  explicit consent
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Lock className="h-5 w-5 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure hosting and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
              <p>
                However, no method of transmission over the internet or
                electronic storage is 100% secure. We cannot guarantee absolute
                security of your information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                We retain your personal information only for as long as
                necessary to fulfill the purposes for which it was collected,
                including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>For the duration of your account with us</li>
                <li>To comply with legal obligations</li>
                <li>To resolve disputes</li>
                <li>To enforce our agreements</li>
              </ul>
              <p>
                When we no longer need your personal information, we will
                securely delete or anonymize it.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <UserCheck className="h-5 w-5 text-primary" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                Depending on your location, you may have the following rights
                regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request access to your personal
                  information
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your
                  information to another service
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your
                  personal information
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of
                  processing
                </li>
              </ul>
              <p>
                To exercise these rights, please contact us at
                privacy@brandlens.com.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                We use cookies and similar tracking technologies to collect and
                use personal information about you. These technologies help us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our service</li>
                <li>Improve our service performance</li>
                <li>Provide personalized content</li>
              </ul>
              <p>
                You can control cookies through your browser settings. However,
                disabling cookies may limit your ability to use certain features
                of our service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                Our service may contain links to third-party websites or
                integrate with third-party services. We are not responsible for
                the privacy practices of these third parties. We encourage you
                to review their privacy policies.
              </p>
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Payment Processing:</strong> Stripe (for secure
                  payment processing)
                </li>
                <li>
                  <strong>Analytics:</strong> Google Analytics (for usage
                  analytics)
                </li>
                <li>
                  <strong>Email:</strong> SendGrid (for transactional emails)
                </li>
                <li>
                  <strong>Support:</strong> Intercom (for customer support)
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">
                International Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                Your information may be transferred to and processed in
                countries other than your country of residence. We ensure
                appropriate safeguards are in place for such transfers,
                including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Adequacy decisions by relevant authorities</li>
                <li>Standard contractual clauses</li>
                <li>Certification schemes</li>
                <li>Other appropriate safeguards</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">
                Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new Privacy
                Policy on this page and updating the &quot;Last updated&quot;
                date.
              </p>
              <p>
                We recommend reviewing this Privacy Policy periodically to stay
                informed about our privacy practices.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-black">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-black/80">
              <p>
                If you have any questions about this Privacy Policy, please
                contact us:
              </p>
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="font-semibold text-black">BrandLens Inc.</p>
                <p>Email: privacy@brandlens.com</p>
                <p>Address: 123 Business Street, San Francisco, CA 94105</p>
                <p>Phone: (555) 123-4567</p>
              </div>
              <p>
                For data protection inquiries specifically, please contact our
                Data Protection Officer at dpo@brandlens.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
