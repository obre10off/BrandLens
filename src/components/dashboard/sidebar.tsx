'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Plus,
  LogOut,
  Moon,
  Sun,
  ExternalLink,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth/client';

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
  const router = useRouter();
  const { data: session } = useSession();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [projects, setProjects] = useState<any[]>([]);

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
        
        // Fetch all projects for the dropdown
        const projectsResponse = await fetch('/api/projects');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.projects || []);
        }
      } catch (error) {
        console.error('Failed to fetch project info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectInfo();
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, [session]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <aside className={cn('flex flex-col h-full bg-white border-r border-gray-200', className)}>
      {/* Logo and Project Selector */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl text-black">brandlens</span>
        </Link>
        
        {/* Enhanced Project Selector */}
        {!loading && projectInfo && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {projectInfo.brandName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-black truncate">{projectInfo.brandName}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem key={project.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {project.brandName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="truncate">{project.brandName}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add New Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 sm:px-0">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-2">
            {section.label && (
              <h3 className="px-3 sm:px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.label}
              </h3>
            )}
            <ul className="px-1 sm:px-3 space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-sm transition-all duration-200',
                        'hover:bg-gray-100 hover:shadow-sm',
                        isActive
                          ? 'bg-primary text-white font-medium shadow-sm'
                          : 'text-gray-600 hover:text-black'
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
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
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Prompt Responses</span>
              <span>{projectInfo.queriesUsed || 0} / {projectInfo.queriesLimit}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
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
              className="block w-full text-center px-3 sm:px-4 py-2 bg-primary text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
            >
              {projectInfo.hasTrial ? 'Upgrade Plan' : 'Start Free 7-day Trial'}
            </Link>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-2 sm:p-3 border-t border-gray-200">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-sm transition-all duration-200',
                    'hover:bg-gray-100 hover:shadow-sm',
                    isActive
                      ? 'bg-primary text-white font-medium shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Enhanced User Account Dropdown */}
      {session?.user && (
        <div className="p-2 sm:p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    {session.user.name?.[0] || session.user.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                </div>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="start" side="top">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{session.user.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/terms" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Terms of Service
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/privacy" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
}