export interface QueryTemplate {
  id: string;
  name: string;
  category: 'general' | 'use-case' | 'feature' | 'alternative' | 'integration';
  query: string;
  variables?: string[];
  description?: string;
}

export const queryTemplates: QueryTemplate[] = [
  // General Comparison Queries
  {
    id: 'general-1',
    name: 'Best in Category 2024',
    category: 'general',
    query: 'best {category} software 2024',
    variables: ['{category}'],
    description: 'General category comparison for current year',
  },
  {
    id: 'general-2',
    name: 'Top Tools for Business',
    category: 'general',
    query: 'top {category} tools for businesses',
    variables: ['{category}'],
    description: 'Business-focused category comparison',
  },
  {
    id: 'general-3',
    name: 'Most Popular Platforms',
    category: 'general',
    query: 'most popular {category} platforms',
    variables: ['{category}'],
    description: 'Popularity-based comparison',
  },
  {
    id: 'general-4',
    name: 'Software Comparison',
    category: 'general',
    query: '{category} software comparison',
    variables: ['{category}'],
    description: 'Direct comparison query',
  },
  {
    id: 'general-5',
    name: 'Enterprise Solutions',
    category: 'general',
    query: 'enterprise {category} solutions',
    variables: ['{category}'],
    description: 'Enterprise-focused comparison',
  },

  // Use Case Specific Queries
  {
    id: 'use-case-1',
    name: 'Best for Use Case',
    category: 'use-case',
    query: 'best {category} for {use_case}',
    variables: ['{category}', '{use_case}'],
    description: 'Use case specific recommendations',
  },
  {
    id: 'use-case-2',
    name: 'Industry Specific',
    category: 'use-case',
    query: '{category} for {industry} companies',
    variables: ['{category}', '{industry}'],
    description: 'Industry-specific recommendations',
  },
  {
    id: 'use-case-3',
    name: 'Team Size Specific',
    category: 'use-case',
    query: '{category} for {team_size} teams',
    variables: ['{category}', '{team_size}'],
    description: 'Team size specific recommendations',
  },
  {
    id: 'use-case-4',
    name: 'Startup Friendly',
    category: 'use-case',
    query: 'affordable {category} for startups',
    variables: ['{category}'],
    description: 'Startup-focused recommendations',
  },
  {
    id: 'use-case-5',
    name: 'Specific Need',
    category: 'use-case',
    query: '{category} with {specific_need}',
    variables: ['{category}', '{specific_need}'],
    description: 'Feature-specific recommendations',
  },

  // Feature Focused Queries
  {
    id: 'feature-1',
    name: 'With Specific Feature',
    category: 'feature',
    query: '{category} with {feature}',
    variables: ['{category}', '{feature}'],
    description: 'Feature-specific search',
  },
  {
    id: 'feature-2',
    name: 'AI Capabilities',
    category: 'feature',
    query: '{category} tools with AI capabilities',
    variables: ['{category}'],
    description: 'AI-enabled tools search',
  },
  {
    id: 'feature-3',
    name: 'Workflow Automation',
    category: 'feature',
    query: '{category} with workflow automation',
    variables: ['{category}'],
    description: 'Automation-focused search',
  },
  {
    id: 'feature-4',
    name: 'Real-time Collaboration',
    category: 'feature',
    query: '{category} with real-time collaboration',
    variables: ['{category}'],
    description: 'Collaboration feature search',
  },
  {
    id: 'feature-5',
    name: 'Advanced Analytics',
    category: 'feature',
    query: '{category} with advanced analytics',
    variables: ['{category}'],
    description: 'Analytics feature search',
  },

  // Alternative Queries
  {
    id: 'alternative-1',
    name: 'Direct Alternative',
    category: 'alternative',
    query: '{brand} alternatives',
    variables: ['{brand}'],
    description: 'Direct alternative search',
  },
  {
    id: 'alternative-2',
    name: 'Comparison vs Brand',
    category: 'alternative',
    query: '{brand} vs {competitor}',
    variables: ['{brand}', '{competitor}'],
    description: 'Direct comparison',
  },
  {
    id: 'alternative-3',
    name: 'Cheaper Alternative',
    category: 'alternative',
    query: 'cheaper alternatives to {brand}',
    variables: ['{brand}'],
    description: 'Price-focused alternatives',
  },
  {
    id: 'alternative-4',
    name: 'Open Source Alternative',
    category: 'alternative',
    query: 'open source alternatives to {brand}',
    variables: ['{brand}'],
    description: 'Open source alternatives',
  },
  {
    id: 'alternative-5',
    name: 'Better Than Brand',
    category: 'alternative',
    query: 'tools better than {brand}',
    variables: ['{brand}'],
    description: 'Superior alternatives search',
  },

  // Integration Queries
  {
    id: 'integration-1',
    name: 'Platform Integration',
    category: 'integration',
    query: '{category} that integrates with {platform}',
    variables: ['{category}', '{platform}'],
    description: 'Integration compatibility search',
  },
  {
    id: 'integration-2',
    name: 'API Integration',
    category: 'integration',
    query: '{category} with API integration',
    variables: ['{category}'],
    description: 'API-enabled tools',
  },
  {
    id: 'integration-3',
    name: 'Zapier Integration',
    category: 'integration',
    query: '{category} with Zapier integration',
    variables: ['{category}'],
    description: 'Zapier-compatible tools',
  },
  {
    id: 'integration-4',
    name: 'CRM Integration',
    category: 'integration',
    query: '{category} that works with {crm}',
    variables: ['{category}', '{crm}'],
    description: 'CRM integration search',
  },
  {
    id: 'integration-5',
    name: 'Native Integration',
    category: 'integration',
    query: '{category} with native {tool} integration',
    variables: ['{category}', '{tool}'],
    description: 'Native integration search',
  },
];

export function getTemplatesByCategory(category: string) {
  return queryTemplates.filter(t => t.category === category);
}

export function getTemplateById(id: string) {
  return queryTemplates.find(t => t.id === id);
}