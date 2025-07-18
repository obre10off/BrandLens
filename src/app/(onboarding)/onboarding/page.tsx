'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type OnboardingStep = 'company' | 'about' | 'analysis' | 'complete';

interface CompanyInfo {
  name: string;
  website: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  role: string;
  companySize: string;
  language: string;
  country: string;
  referralSource: string;
}

interface AnalysisResult {
  description: string;
  industry: string;
  keyFeatures: string[];
  competitors: string[];
  icp: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('company');
  const [loading, setLoading] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    website: '',
  });
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    role: '',
    companySize: '',
    language: 'en',
    country: 'US',
    referralSource: '',
  });
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo.name || !companyInfo.website) {
      toast.error('Please fill in all fields');
      return;
    }
    setCurrentStep('about');
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.role || !personalInfo.companySize) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      // Analyze company using AI
      const response = await fetch('/api/onboarding/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyInfo, personalInfo }),
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      setAnalysisResult(result);
      setCurrentStep('analysis');
    } catch (error) {
      toast.error('Failed to analyze company information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // Save onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyInfo,
          personalInfo,
          analysisResult,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to complete onboarding');
      
      toast.success('Welcome to BrandLens!');
      router.push('/dashboard?tour=true');
    } catch (error) {
      toast.error('Failed to complete onboarding');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = {
    company: {
      title: 'Welcome',
      description: "Let's start with your brand information",
      icon: Building2,
    },
    about: {
      title: 'About You',
      description: 'Tell us a bit about yourself',
      icon: User,
    },
    analysis: {
      title: 'AI Analysis',
      description: 'Here\'s what we found about your brand',
      icon: Sparkles,
    },
    complete: {
      title: 'All Set!',
      description: 'Your brand monitoring is ready',
      icon: Sparkles,
    },
  };

  const currentConfig = stepConfig[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-black">
              Step {currentStep === 'company' ? 1 : currentStep === 'about' ? 2 : 3} of 3
            </span>
            <span className="text-sm text-black">
              {Math.round(
                currentStep === 'company' ? 33 : currentStep === 'about' ? 66 : 100
              )}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{
                width: currentStep === 'company' ? '33%' : currentStep === 'about' ? '66%' : '100%',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <currentConfig.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl text-black">{currentConfig.title}</CardTitle>
                <CardDescription className="text-black">{currentConfig.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 'company' && (
                  <form onSubmit={handleCompanySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        placeholder="Acme Inc."
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-website">Company Website</Label>
                      <Input
                        id="company-website"
                        type="url"
                        placeholder="https://viewprinter.tech/"
                        value={companyInfo.website}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Next
                    </Button>
                  </form>
                )}

                {currentStep === 'about' && (
                  <form onSubmit={handlePersonalSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          value={personalInfo.firstName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          value={personalInfo.lastName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role</Label>
                      <Select
                        value={personalInfo.role}
                        onValueChange={(value) => setPersonalInfo({ ...personalInfo, role: value })}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="founder">Founder/CEO</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-size">Company Size</Label>
                      <Select
                        value={personalInfo.companySize}
                        onValueChange={(value) => setPersonalInfo({ ...personalInfo, companySize: value })}
                      >
                        <SelectTrigger id="company-size">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={personalInfo.language}
                          onValueChange={(value) => setPersonalInfo({ ...personalInfo, language: value })}
                        >
                          <SelectTrigger id="language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={personalInfo.country}
                          onValueChange={(value) => setPersonalInfo({ ...personalInfo, country: value })}
                        >
                          <SelectTrigger id="country">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="ES">Spain</SelectItem>
                            <SelectItem value="BR">Brazil</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral">How did you hear about us?</Label>
                      <Select
                        value={personalInfo.referralSource}
                        onValueChange={(value) => setPersonalInfo({ ...personalInfo, referralSource: value })}
                      >
                        <SelectTrigger id="referral">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Search</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="friend">Friend/Colleague</SelectItem>
                          <SelectItem value="blog">Blog Post</SelectItem>
                          <SelectItem value="producthunt">Product Hunt</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Next (Step 3 of 15)'
                      )}
                    </Button>
                  </form>
                )}

                {currentStep === 'analysis' && analysisResult && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 text-black">Company Description</h3>
                        <p className="text-sm text-black">{analysisResult.description}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 text-black">Industry</h3>
                        <p className="text-sm text-black">{analysisResult.industry}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 text-black">Key Features</h3>
                        <ul className="list-disc list-inside text-sm text-black">
                          {analysisResult.keyFeatures.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 text-black">Suggested Competitors</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.competitors.map((competitor, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-secondary text-black rounded-full text-sm"
                            >
                              {competitor}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 text-black">Ideal Customer Profile</h3>
                        <p className="text-sm text-black">{analysisResult.icp}</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleCompleteOnboarding}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting up your account...
                        </>
                      ) : (
                        'Complete Setup'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}