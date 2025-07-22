'use client';

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
  Star,
  Menu,
  Eye,
  Shield,
  Rocket,
  Brain
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Enhanced Navigation with Mobile Support */}
      <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 transition-all duration-300 hover:shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <BarChart3 className="h-7 w-7 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 -z-10"></div>
            </div>
            <span className="font-bold text-xl text-black tracking-tight">BrandLens</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/pricing">
              <Button 
                variant="ghost" 
                className="relative hover:text-primary transition-all duration-300 hover:bg-primary/5 group px-4"
              >
                Pricing
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="relative hover:text-primary transition-all duration-300 hover:bg-primary/5 group px-4"
              >
                Login
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-primary group">
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section with Sticky Effects */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/12 pointer-events-none" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl animate-pulse animation-delay-300"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/10 rounded-full blur-lg animate-bounce animation-delay-500" style={{animationDuration: '3s'}}></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8 sm:space-y-10">
            {/* Enhanced Badge */}
            <div className="animate-slideDown">
              <Badge 
                variant="secondary" 
                className="relative px-6 py-2.5 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-500 hover:scale-105 border-primary/20 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Sparkles className="h-4 w-4 mr-2 inline text-primary animate-pulse" />
                <span className="font-semibold">56% cheaper than PromptWatch</span>
              </Badge>
            </div>

            {/* Enhanced Main Title */}
            <div className="animate-slideUp space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-black leading-tight">
                Track Your Brand in
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                    AI Conversations
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-600/20 to-purple-600/20 blur-lg opacity-30 animate-pulse"></div>
                </span>
              </h1>
            </div>

            {/* Enhanced Subtitle */}
            <div className="animate-slideUp animation-delay-200">
              <p className="text-lg sm:text-xl lg:text-2xl text-black/80 max-w-4xl mx-auto leading-relaxed font-medium">
                Monitor how <span className="font-semibold text-primary">ChatGPT, Claude, and other AI platforms</span> mention your SaaS.
                <br className="hidden sm:block" />
                Get weekly insights, competitor analysis, and actionable recommendations.
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-8 animate-slideUp animation-delay-400">
              <Link href="/signup" className="group">
                <Button 
                  size="lg" 
                  className="relative overflow-hidden bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all duration-300 px-10 py-4 text-lg font-semibold transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    <Rocket className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    Start 7-Day Free Trial
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </span>
                </Button>
              </Link>
              <Link href="#features" className="group">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="relative overflow-hidden border-2 border-primary/30 hover:border-primary bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300 px-10 py-4 text-lg font-semibold hover:bg-primary/5 transform hover:scale-105"
                >
                  <Eye className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                  See How It Works
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-blue-600 transition-all duration-300 group-hover:w-full"></div>
                </Button>
              </Link>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="animate-fadeIn animation-delay-600">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-black/70 pt-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/80">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/80">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">25 free queries included</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/80">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Grid with Sticky Elements */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-primary/3 to-primary/8 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 sm:mb-20 space-y-6">
            <div className="animate-fadeIn">
              <Badge variant="secondary" className="px-4 py-2 mb-6 bg-white/80 backdrop-blur shadow-md">
                <Brain className="h-4 w-4 mr-2 text-primary" />
                Powered by AI Intelligence
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-black animate-fadeIn leading-tight">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Win in AI Search
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-black/70 max-w-3xl mx-auto leading-relaxed">
              Built specifically for SaaS companies, not generic monitoring. 
              Get the edge over competitors who aren&apos;t tracking their AI presence.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature Card 1 */}
            <Card className="group relative p-8 space-y-6 hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur hover:bg-white hover:-translate-y-2 animate-slideUp overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mt-4 group-hover:text-primary transition-colors duration-300">50+ SaaS Queries</h3>
                <p className="text-black/70 leading-relaxed mt-3">
                  Pre-built queries designed for SaaS categories. No setup needed - 
                  just select your category and start tracking in minutes.
                </p>
              </div>
            </Card>

            {/* Feature Card 2 */}
            <Card className="group relative p-8 space-y-6 hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur hover:bg-white hover:-translate-y-2 animate-slideUp animation-delay-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mt-4 group-hover:text-blue-600 transition-colors duration-300">Competitor Analysis</h3>
                <p className="text-black/70 leading-relaxed mt-3">
                  See who&apos;s winning the AI mention battle. Track up to 10 competitors 
                  and identify gaps in your visibility strategy.
                </p>
              </div>
            </Card>

            {/* Feature Card 3 */}
            <Card className="group relative p-8 space-y-6 hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur hover:bg-white hover:-translate-y-2 animate-slideUp animation-delay-200 overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mt-4 group-hover:text-green-600 transition-colors duration-300">Actionable Insights</h3>
                <p className="text-black/70 leading-relaxed mt-3">
                  Weekly reports with specific recommendations. Know exactly what to 
                  do to improve your AI visibility and beat competitors.
                </p>
              </div>
            </Card>

            {/* Feature Card 4 */}
            <Card className="group relative p-8 space-y-6 hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur hover:bg-white hover:-translate-y-2 animate-slideUp animation-delay-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mt-4 group-hover:text-purple-600 transition-colors duration-300">Gap Analysis</h3>
                <p className="text-black/70 leading-relaxed mt-3">
                  Discover queries where competitors appear but you don&apos;t. 
                  Turn blind spots into profitable opportunities.
                </p>
              </div>
            </Card>

            {/* Feature Card 5 */}
            <Card className="group relative p-8 space-y-6 hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur hover:bg-white hover:-translate-y-2 animate-slideUp animation-delay-400 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mt-4 group-hover:text-orange-600 transition-colors duration-300">Real-time Updates</h3>
                <p className="text-black/70 leading-relaxed mt-3">
                  Get notified when important mentions happen. React quickly to 
                  changes in your AI visibility before competitors notice.
                </p>
              </div>
            </Card>

            {/* Feature Card 6 */}
            <Card className="group relative p-8 space-y-6 hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur hover:bg-white hover:-translate-y-2 animate-slideUp animation-delay-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mt-4 group-hover:text-pink-600 transition-colors duration-300">Sentiment Analysis</h3>
                <p className="text-black/70 leading-relaxed mt-3">
                  Understand not just if you&apos;re mentioned, but how. Track positive, 
                  neutral, and negative sentiment trends over time.
                </p>
              </div>
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