'use client';

import { useEffect, useState, useRef } from 'react';
import { driver } from 'driver.js';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import 'driver.js/dist/driver.css';

export function OnboardingTour() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shouldShowTour = searchParams.get('tour') === 'true';
  const tourStep = searchParams.get('tourStep');
  const [driverInstance, setDriverInstance] = useState<any>(null);
  const driverRef = useRef<any>(null);

  useEffect(() => {
    if (!shouldShowTour) {
      return;
    }

    // Define tour steps for each page
    const tourPages = [
      {
        path: '/dashboard',
        steps: [
          {
            element: '.sidebar',
            popover: {
              title: 'Welcome to BrandLens! 🎉',
              description:
                'This is your navigation sidebar. All features are accessible from here.',
              side: 'right',
              align: 'start',
            },
          },
          {
            element: '[href="/dashboard"]',
            popover: {
              title: 'Dashboard Overview',
              description:
                'Your main dashboard shows key metrics and recent activity.',
              side: 'right',
            },
          },
          {
            element: '.quick-stats',
            popover: {
              title: 'Quick Stats',
              description:
                'Get a quick overview of your brand performance at a glance.',
              side: 'bottom',
            },
          },
          {
            element: '.recent-activity',
            popover: {
              title: 'Recent Mentions',
              description:
                'See the latest mentions of your brand across AI platforms.',
              side: 'top',
            },
          },
        ],
      },
      {
        path: '/dashboard/brand-book',
        steps: [
          {
            element: '[href="/dashboard/brand-book"]',
            popover: {
              title: 'Brand Book',
              description:
                'Manage your brand assets, guidelines, and key messaging here.',
              side: 'right',
            },
          },
        ],
      },
      {
        path: '/dashboard/competitors',
        steps: [
          {
            element: '[href="/dashboard/competitors"]',
            popover: {
              title: 'Competitor Tracking',
              description:
                'Add and monitor up to 5 competitors to see how you compare.',
              side: 'right',
            },
          },
        ],
      },
      {
        path: '/dashboard/queries',
        steps: [
          {
            element: '[href="/dashboard/queries"]',
            popover: {
              title: 'Brand Queries',
              description:
                'Manage and execute queries to monitor your brand across AI platforms.',
              side: 'right',
            },
          },
          {
            element: '.run-analysis',
            popover: {
              title: 'Run Analysis',
              description:
                'Execute queries to get fresh data about your brand mentions.',
              side: 'top',
            },
          },
        ],
      },
      {
        path: '/dashboard/responses',
        steps: [
          {
            element: '[href="/dashboard/responses"]',
            popover: {
              title: 'AI Responses',
              description:
                'View all responses from ChatGPT and Claude about your brand.',
              side: 'right',
            },
          },
        ],
      },
      {
        path: '/dashboard/billing',
        steps: [
          {
            element: '[href="/dashboard/billing"]',
            popover: {
              title: 'Billing & Plans',
              description: 'Manage your subscription and view usage details.',
              side: 'right',
            },
          },
        ],
      },
      {
        path: '/dashboard/settings',
        steps: [
          {
            element: '[href="/dashboard/settings"]',
            popover: {
              title: 'Settings',
              description:
                'Configure your account, notifications, and preferences.',
              side: 'right',
            },
          },
        ],
      },
    ];

    // Find current page in tour
    const currentPageIndex = tourPages.findIndex(
      page => page.path === pathname
    );
    if (currentPageIndex === -1) {
      // Not on a tour page, navigate to first page
      router.push('/dashboard?tour=true&tourStep=0');
      return;
    }

    // Get all steps across all pages
    const allSteps: any[] = [];
    tourPages.forEach((page, pageIndex) => {
      page.steps.forEach((step, stepIndex) => {
        allSteps.push({
          ...step,
          pageIndex,
          path: page.path,
          globalIndex: allSteps.length,
        });
      });
    });

    // Determine current step
    let currentStepIndex = parseInt(tourStep || '0');

    // Find steps for current page
    const currentPageSteps = allSteps.filter(step => step.path === pathname);
    const firstStepOnCurrentPage = allSteps.findIndex(
      step => step.path === pathname
    );

    // If we're on a new page, start from the first step of that page
    if (!tourStep || currentStepIndex < firstStepOnCurrentPage) {
      currentStepIndex = firstStepOnCurrentPage;
    }

    // Configure driver with current page steps
    const driverObj = driver({
      showProgress: true,
      progressText: `{{current}} of ${allSteps.length}`,
      steps: allSteps.map((step, index) => ({
        element: step.element,
        popover: {
          ...step.popover,
          onNextClick: () => {
            const nextIndex = index + 1;
            if (nextIndex < allSteps.length) {
              const nextStep = allSteps[nextIndex];
              if (nextStep.path !== pathname) {
                // Navigate to next page
                router.push(`${nextStep.path}?tour=true&tourStep=${nextIndex}`);
              } else {
                // Continue on same page
                driverObj.moveNext();
              }
            } else {
              // Tour complete
              router.push('/dashboard');
            }
          },
          onPrevClick: () => {
            const prevIndex = index - 1;
            if (prevIndex >= 0) {
              const prevStep = allSteps[prevIndex];
              if (prevStep.path !== pathname) {
                // Navigate to previous page
                router.push(`${prevStep.path}?tour=true&tourStep=${prevIndex}`);
              } else {
                // Continue on same page
                driverObj.movePrevious();
              }
            }
          },
        },
      })),
      onDestroyStarted: () => {
        if (
          !driverObj.hasNextStep() ||
          confirm('Are you sure you want to skip the tour?')
        ) {
          router.push('/dashboard');
          return true;
        }
        return false;
      },
    });

    // Add final step
    allSteps.push({
      popover: {
        title: "You're All Set! 🚀",
        description:
          'Start by running your first analysis or adding competitors. Need help? Check the docs anytime.',
        onNextClick: () => {
          router.push('/dashboard');
        },
      },
    });

    driverRef.current = driverObj;
    setDriverInstance(driverObj);

    // Start tour from the current step
    setTimeout(() => {
      driverObj.drive(currentStepIndex);
    }, 500);

    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, [shouldShowTour, tourStep, pathname, router]);

  return null;
}
