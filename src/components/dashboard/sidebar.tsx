'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  Users,
  UserCircle,
  Monitor,
  FileText,
  MessageSquare,
  Quote,
  TrendingUp,
  Globe,
  Map,
  Settings,
  HelpCircle,
  CreditCard,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/client';

interface SidebarProps {
  className?: string;
}

interface ProjectInfo {
  name: string;
  brandName: string;
  queriesUsed?: number;
  queriesLimit?: number;
  hasTrial?: boolean;
  hasSubscription?: boolean;
  subscriptionPlan?: string;
}

const navigationSections = [
  {
    label: null, // Main section without label
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
      },
      {
        title: 'Brand Book',
        href: '/dashboard/brand-book',
        icon: BookOpen,
      },
      {
        title: 'Competitors',
        href: '/dashboard/competitors',
        icon: Users,
      },
      {
        title: 'Personas',
        href: '/dashboard/personas',
        icon: UserCircle,
      },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      {
        title: 'Queries',
        href: '/dashboard/queries',
        icon: Zap,
      },
      {
        title: 'Monitors',
        href: '/dashboard/monitors',
        icon: Monitor,
      },
      {
        title: 'Prompts',
        href: '/dashboard/prompts',
        icon: FileText,
      },
      {
        title: 'Responses',
        href: '/dashboard/responses',
        icon: MessageSquare,
      },
      {
        title: 'Citations',
        href: '/dashboard/citations',
        icon: Quote,
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      {
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: TrendingUp,
      },
      {
        title: 'Crawlers',
        href: '/dashboard/crawlers',
        icon: Globe,
      },
    ],
  },
  {
    label: 'Website',
    items: [
      {
        title: 'Sitemap',
        href: '/dashboard/sitemap',
        icon: Map,
      },
    ],
  },
];

const bottomItems = [
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Help',
    href: '/dashboard/help',
    icon: HelpCircle,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectInfo = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/current-project');
        if (response.ok) {
          const data = await response.json();
          setProjectInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch project info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectInfo();
  }, [session]);

  return (
    <aside className={cn('flex flex-col h-full bg-white border-r border-gray-200', className)}>
      {/* Logo and Project Selector */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-black">brandlens</span>
        </Link>
        
        {/* Project Selector */}
        {!loading && projectInfo && (
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {projectInfo.brandName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-black">{projectInfo.brandName}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-1">
            {section.label && (
              <h3 className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.label}
              </h3>
            )}
            <ul className="px-3">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        'hover:bg-gray-100',
                        isActive
                          ? 'bg-gray-100 text-black font-medium'
                          : 'text-gray-600 hover:text-black'
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Usage Metrics */}
      {projectInfo && projectInfo.queriesLimit && (
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Prompt Responses</span>
              <span>{projectInfo.queriesUsed || 0} / {projectInfo.queriesLimit}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    ((projectInfo.queriesUsed || 0) / projectInfo.queriesLimit) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Analytics Events</span>
              <span>0 / 0</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full" />
          </div>

          {!projectInfo.hasSubscription && (
            <Link
              href="/dashboard/billing"
              className="block w-full text-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              {projectInfo.hasTrial ? 'Upgrade Plan' : 'Start Free 7-day Trial'}
            </Link>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-gray-200">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    'hover:bg-gray-100',
                    isActive
                      ? 'bg-gray-100 text-black font-medium'
                      : 'text-gray-600 hover:text-black'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Account */}
      {session?.user && (
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-lg transition-colors">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {session.user.name?.[0] || session.user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </button>
        </div>
      )}
    </aside>
  );
}