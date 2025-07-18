import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  MessageSquare,
  Sparkles,
  Check,
  Star
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <BarChart3 className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="font-bold text-xl text-black">BrandLens</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="hover:text-primary transition-colors">Pricing</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="hover:text-primary transition-colors">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="shadow-md hover:shadow-lg transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Gradient Background */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-6 animate-fadeIn">
            <Badge variant="secondary" className="px-4 py-1.5 shadow-sm animate-slideDown">
              <Sparkles className="h-3 w-3 mr-1 inline" />
              56% cheaper than PromptWatch
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black animate-slideUp">
              Track Your Brand in
              <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> AI Conversations</span>
            </h1>
            <p className="text-xl md:text-2xl text-black/80 max-w-3xl mx-auto leading-relaxed animate-slideUp animation-delay-200">
              Monitor how ChatGPT, Claude, and other AI platforms mention your SaaS. 
              Get weekly insights, competitor analysis, and actionable recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-slideUp animation-delay-400">
              <Link href="/signup">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 px-8">
                  Start 7-Day Free Trial <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="shadow-md hover:shadow-lg transition-all duration-300 px-8">
                  See Demo
                </Button>
              </Link>
            </div>
            <div className="text-sm text-black/60 flex items-center justify-center gap-4 animate-fadeIn animation-delay-600">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                25 free queries
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-black animate-fadeIn">
              Everything You Need to Win in AI Search
            </h2>
            <p className="text-lg text-black/70 max-w-2xl mx-auto">
              Built specifically for SaaS companies, not generic monitoring
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur group animate-slideUp">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">50+ SaaS Queries</h3>
              <p className="text-black/70 leading-relaxed">
                Pre-built queries designed for SaaS categories. No setup needed - 
                just select your category and start tracking.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur group animate-slideUp animation-delay-100">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">Competitor Analysis</h3>
              <p className="text-black/70 leading-relaxed">
                See who&apos;s winning the AI mention battle. Track up to 10 competitors 
                and identify gaps in your visibility.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur group animate-slideUp animation-delay-200">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">Actionable Insights</h3>
              <p className="text-black/70 leading-relaxed">
                Weekly reports with specific recommendations. Know exactly what to 
                do to improve your AI visibility.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur group animate-slideUp animation-delay-300">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">Gap Analysis</h3>
              <p className="text-black/70 leading-relaxed">
                Discover queries where competitors appear but you don&apos;t. 
                Turn blind spots into opportunities.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur group animate-slideUp animation-delay-400">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">Real-time Updates</h3>
              <p className="text-black/70 leading-relaxed">
                Get notified when important mentions happen. React quickly to 
                changes in your AI visibility.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur group animate-slideUp animation-delay-500">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-black">Sentiment Analysis</h3>
              <p className="text-black/70 leading-relaxed">
                Understand not just if you&apos;re mentioned, but how. Track positive, 
                neutral, and negative sentiment trends.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black">Simple, Transparent Pricing</h2>
            <p className="text-lg text-black/70">Choose the plan that fits your growth stage</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur relative group">
              <h3 className="text-2xl font-semibold mb-2 text-black">Starter</h3>
              <div className="text-4xl font-bold mb-4 text-black">$39<span className="text-lg font-normal text-black/60">/mo</span></div>
              <p className="text-black/70 mb-6">Perfect for small SaaS</p>
              <div className="space-y-3 text-sm text-black/60">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>5 brand monitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>25 queries/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Weekly reports</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-primary bg-white relative transform scale-105 z-10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="px-4 py-1 shadow-md bg-primary text-white">
                  <Star className="h-3 w-3 mr-1 inline" />
                  Most Popular
                </Badge>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-black mt-2">Growth</h3>
              <div className="text-4xl font-bold mb-4 text-primary">$79<span className="text-lg font-normal text-black/60">/mo</span></div>
              <p className="text-black/70 mb-6">For growing companies</p>
              <div className="space-y-3 text-sm text-black/60">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>15 brand monitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>100 queries/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Daily reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Competitor tracking</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur relative group">
              <h3 className="text-2xl font-semibold mb-2 text-black">Scale</h3>
              <div className="text-4xl font-bold mb-4 text-black">$149<span className="text-lg font-normal text-black/60">/mo</span></div>
              <p className="text-black/70 mb-6">For larger teams</p>
              <div className="space-y-3 text-sm text-black/60">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Unlimited monitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>500 queries/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Real-time alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>API access</span>
                </div>
              </div>
            </Card>
          </div>
          <Link href="/pricing">
            <Button className="mt-12 shadow-md hover:shadow-lg transition-all duration-300" variant="outline" size="lg">
              View Full Pricing Details
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary via-primary to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto max-w-4xl text-center space-y-8 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Start Tracking Your AI Visibility Today
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join SaaS companies already improving their AI presence and staying ahead of the competition
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 px-8">
                Start Free Trial <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="gap-2 text-white border-white hover:bg-white hover:text-primary transition-all duration-300 px-8">
                View Pricing
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm opacity-75">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              7-day trial
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              25 queries
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              No credit card
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-4 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl text-black">BrandLens</span>
              </div>
              <p className="text-black/70 text-sm">
                Monitor your brand&apos;s AI visibility and stay ahead of the competition.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-black">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/features" className="text-black/70 hover:text-primary transition-colors block">Features</Link>
                <Link href="/pricing" className="text-black/70 hover:text-primary transition-colors block">Pricing</Link>
                <Link href="/demo" className="text-black/70 hover:text-primary transition-colors block">Demo</Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-black">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="text-black/70 hover:text-primary transition-colors block">About</Link>
                <Link href="/blog" className="text-black/70 hover:text-primary transition-colors block">Blog</Link>
                <Link href="/careers" className="text-black/70 hover:text-primary transition-colors block">Careers</Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-black">Support</h4>
              <div className="space-y-2 text-sm">
                <Link href="/help" className="text-black/70 hover:text-primary transition-colors block">Help Center</Link>
                <Link href="/contact" className="text-black/70 hover:text-primary transition-colors block">Contact</Link>
                <Link href="/privacy" className="text-black/70 hover:text-primary transition-colors block">Privacy</Link>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-black/60">
              © 2024 BrandLens. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-black/60">
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}