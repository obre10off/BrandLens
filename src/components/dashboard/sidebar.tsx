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
  ChevronLeft,
  ChevronRight,
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

interface Project {
  id: string;
  brandName: string;
  brandDomain: string;
  category?: string;
  description?: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    
    // Load theme from localStorage with error handling
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }

    // Load sidebar collapsed state from localStorage
    try {
      const savedCollapsed = localStorage.getItem('sidebar-collapsed');
      if (savedCollapsed) {
        setIsCollapsed(JSON.parse(savedCollapsed));
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
    }
  }, [session]);

  // Helper function for progress calculation
  const calculateProgress = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
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
    <aside className={cn(
      'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Logo and Project Selector */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Link href="/dashboard" className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
            <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            {!isCollapsed && <span className="font-bold text-lg sm:text-xl text-black">brandlens</span>}
          </Link>
          
          {/* Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
        
        {/* Enhanced Project Selector */}
        {!loading && projectInfo && !isCollapsed && (
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
            <DropdownMenuContent 
              className="w-64 !bg-white border-2 border-gray-400 shadow-2xl rounded-xl z-[9999] p-2" 
              align="start"
              sideOffset={8}
              alignOffset={4}
              style={{ backgroundColor: '#ffffff', opacity: 1 }}
            >
              <DropdownMenuLabel className="px-4 py-3 !bg-white rounded-lg">
                <span className="text-sm font-semibold text-gray-900">Switch Project</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem 
                  key={project.id} 
                  className="cursor-pointer px-4 py-2.5 !bg-white hover:!bg-gray-100 transition-colors focus:!bg-gray-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {project.brandName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="truncate text-sm text-gray-900">{project.brandName}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer px-4 py-2.5 !bg-white hover:!bg-gray-100 transition-colors focus:!bg-gray-100 rounded-lg">
                <Plus className="h-4 w-4 mr-3 text-gray-600" />
                <span className="text-sm text-gray-900">Add New Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 sm:px-0">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-2">
            {section.label && !isCollapsed && (
              <h3 className="px-3 sm:px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.label}
              </h3>
            )}
            <ul className={cn("px-1 sm:px-3 space-y-1", isCollapsed && "px-2")}>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-lg text-sm transition-all duration-200',
                        'hover:bg-gray-100 hover:shadow-sm',
                        isCollapsed 
                          ? 'justify-center p-2 w-10 h-10 mx-auto' 
                          : 'gap-2 sm:gap-3 px-2 sm:px-3 py-2',
                        isActive
                          ? 'bg-primary text-white font-medium shadow-sm'
                          : 'text-gray-600 hover:text-black'
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Usage Metrics */}
      {projectInfo && projectInfo.queriesLimit && !isCollapsed && (
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
                  width: `${calculateProgress(projectInfo.queriesUsed || 0, projectInfo.queriesLimit)}%`,
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
                    'flex items-center rounded-lg text-sm transition-all duration-200',
                    'hover:bg-gray-100 hover:shadow-sm',
                    isCollapsed 
                      ? 'justify-center p-2 w-10 h-10 mx-auto' 
                      : 'gap-2 sm:gap-3 px-2 sm:px-3 py-2',
                    isActive
                      ? 'bg-primary text-white font-medium shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
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
              <button className={cn(
                "flex items-center text-sm text-left hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm",
                isCollapsed 
                  ? "justify-center p-2 w-10 h-10 mx-auto" 
                  : "w-full gap-2 sm:gap-3 px-2 sm:px-3 py-2"
              )}
              title={isCollapsed ? session.user.name || session.user.email : undefined}
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    {session.user.name?.[0] || session.user.email[0].toUpperCase()}
                  </span>
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 mb-3 !bg-white border-2 border-gray-400 shadow-2xl rounded-xl z-[9999] p-2" 
              align="start" 
              side="top"
              sideOffset={12}
              alignOffset={8}
              style={{ backgroundColor: '#ffffff', opacity: 1 }}
            >
              <DropdownMenuLabel className="px-4 py-3 !bg-white rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{session.user.name || 'User'}</p>
                  <p className="text-xs text-gray-600 break-all">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={toggleTheme} 
                className="cursor-pointer px-4 py-2.5 !bg-white hover:!bg-gray-100 transition-colors focus:!bg-gray-100 rounded-lg"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 mr-3 text-gray-600" />
                ) : (
                  <Sun className="h-4 w-4 mr-3 text-gray-600" />
                )}
                <span className="text-sm text-gray-900">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link 
                  href="/terms" 
                  target="_blank" 
                  className="flex items-center px-4 py-2.5 !bg-white hover:!bg-gray-100 transition-colors focus:!bg-gray-100 rounded-lg"
                >
                  <ExternalLink className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm text-gray-900">Terms of Service</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link 
                  href="/privacy" 
                  target="_blank"
                  className="flex items-center px-4 py-2.5 !bg-white hover:!bg-gray-100 transition-colors focus:!bg-gray-100 rounded-lg"
                >
                  <ExternalLink className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm text-gray-900">Privacy Policy</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer px-4 py-2.5 !bg-white text-red-600 hover:!bg-red-50 hover:text-red-700 focus:!bg-red-50 focus:text-red-700 transition-colors rounded-lg"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span className="text-sm font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
}