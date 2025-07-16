import { db } from './index';
import { queryTemplates } from './schema';

const saasQueryTemplates = [
  // General Comparison Queries
  {
    category: 'general',
    template: 'best {category} software 2024',
    variables: ['{category}'],
    description: 'General category comparison for current year',
  },
  {
    category: 'general',
    template: 'top {category} tools for businesses',
    variables: ['{category}'],
    description: 'Business-focused category comparison',
  },
  {
    category: 'general',
    template: 'most popular {category} platforms',
    variables: ['{category}'],
    description: 'Popularity-based comparison',
  },
  {
    category: 'general',
    template: '{category} software comparison',
    variables: ['{category}'],
    description: 'Direct comparison query',
  },
  {
    category: 'general',
    template: 'enterprise {category} solutions',
    variables: ['{category}'],
    description: 'Enterprise-focused comparison',
  },

  // Use Case Specific Queries
  {
    category: 'use-case',
    template: 'best {category} for {use_case}',
    variables: ['{category}', '{use_case}'],
    description: 'Use case specific recommendations',
  },
  {
    category: 'use-case',
    template: '{category} for {industry} companies',
    variables: ['{category}', '{industry}'],
    description: 'Industry-specific recommendations',
  },
  {
    category: 'use-case',
    template: '{category} for {team_size} teams',
    variables: ['{category}', '{team_size}'],
    description: 'Team size specific recommendations',
  },
  {
    category: 'use-case',
    template: 'affordable {category} for startups',
    variables: ['{category}'],
    description: 'Startup-focused recommendations',
  },
  {
    category: 'use-case',
    template: '{category} with {specific_need}',
    variables: ['{category}', '{specific_need}'],
    description: 'Feature-specific recommendations',
  },

  // Feature Focused Queries
  {
    category: 'feature',
    template: '{category} with {feature}',
    variables: ['{category}', '{feature}'],
    description: 'Feature-specific search',
  },
  {
    category: 'feature',
    template: '{category} tools with AI capabilities',
    variables: ['{category}'],
    description: 'AI-enabled tools search',
  },
  {
    category: 'feature',
    template: '{category} with workflow automation',
    variables: ['{category}'],
    description: 'Automation-focused search',
  },
  {
    category: 'feature',
    template: '{category} with real-time collaboration',
    variables: ['{category}'],
    description: 'Collaboration feature search',
  },
  {
    category: 'feature',
    template: '{category} with advanced analytics',
    variables: ['{category}'],
    description: 'Analytics feature search',
  },

  // Alternative Searches
  {
    category: 'alternative',
    template: '{competitor} alternatives',
    variables: ['{competitor}'],
    description: 'Direct competitor alternatives',
  },
  {
    category: 'alternative',
    template: 'free alternatives to {competitor}',
    variables: ['{competitor}'],
    description: 'Free alternatives search',
  },
  {
    category: 'alternative',
    template: 'cheaper alternatives to {competitor}',
    variables: ['{competitor}'],
    description: 'Budget alternatives search',
  },
  {
    category: 'alternative',
    template: 'open source alternatives to {competitor}',
    variables: ['{competitor}'],
    description: 'Open source alternatives',
  },
  {
    category: 'alternative',
    template: '{competitor} vs {other_competitor}',
    variables: ['{competitor}', '{other_competitor}'],
    description: 'Head-to-head comparison',
  },

  // Integration Queries
  {
    category: 'integration',
    template: '{category} that integrates with {tool}',
    variables: ['{category}', '{tool}'],
    description: 'Integration-specific search',
  },
  {
    category: 'integration',
    template: '{category} with Slack integration',
    variables: ['{category}'],
    description: 'Slack integration search',
  },
  {
    category: 'integration',
    template: '{category} with API access',
    variables: ['{category}'],
    description: 'API availability search',
  },
  {
    category: 'integration',
    template: '{category} with Zapier support',
    variables: ['{category}'],
    description: 'Zapier integration search',
  },
  {
    category: 'integration',
    template: '{category} with webhook support',
    variables: ['{category}'],
    description: 'Webhook capability search',
  },

  // Pricing Queries
  {
    category: 'pricing',
    template: 'free {category} tools',
    variables: ['{category}'],
    description: 'Free tools search',
  },
  {
    category: 'pricing',
    template: 'affordable {category} under ${price}',
    variables: ['{category}', '{price}'],
    description: 'Budget-constrained search',
  },
  {
    category: 'pricing',
    template: '{category} with free trial',
    variables: ['{category}'],
    description: 'Free trial availability',
  },
  {
    category: 'pricing',
    template: '{category} pricing comparison',
    variables: ['{category}'],
    description: 'Pricing comparison query',
  },
  {
    category: 'pricing',
    template: 'best value {category} software',
    variables: ['{category}'],
    description: 'Value-focused search',
  },

  // Technology Stack Queries
  {
    category: 'tech-stack',
    template: '{category} built with {technology}',
    variables: ['{category}', '{technology}'],
    description: 'Technology-specific search',
  },
  {
    category: 'tech-stack',
    template: 'cloud-based {category} solutions',
    variables: ['{category}'],
    description: 'Cloud solutions search',
  },
  {
    category: 'tech-stack',
    template: 'self-hosted {category} options',
    variables: ['{category}'],
    description: 'Self-hosted solutions',
  },
  {
    category: 'tech-stack',
    template: '{category} with mobile apps',
    variables: ['{category}'],
    description: 'Mobile app availability',
  },
  {
    category: 'tech-stack',
    template: 'cross-platform {category} tools',
    variables: ['{category}'],
    description: 'Cross-platform search',
  },

  // Compliance & Security Queries
  {
    category: 'compliance',
    template: 'GDPR compliant {category} tools',
    variables: ['{category}'],
    description: 'GDPR compliance search',
  },
  {
    category: 'compliance',
    template: 'SOC 2 certified {category} platforms',
    variables: ['{category}'],
    description: 'SOC 2 certification search',
  },
  {
    category: 'compliance',
    template: 'secure {category} for healthcare',
    variables: ['{category}'],
    description: 'Healthcare compliance search',
  },
  {
    category: 'compliance',
    template: '{category} with end-to-end encryption',
    variables: ['{category}'],
    description: 'Security feature search',
  },
  {
    category: 'compliance',
    template: 'privacy-focused {category} tools',
    variables: ['{category}'],
    description: 'Privacy-focused search',
  },

  // Review & Recommendation Queries
  {
    category: 'review',
    template: '{category} software reviews 2024',
    variables: ['{category}'],
    description: 'Current year reviews',
  },
  {
    category: 'review',
    template: 'user recommended {category} tools',
    variables: ['{category}'],
    description: 'User recommendation search',
  },
  {
    category: 'review',
    template: 'highest rated {category} platforms',
    variables: ['{category}'],
    description: 'Rating-based search',
  },
  {
    category: 'review',
    template: 'pros and cons of {specific_tool}',
    variables: ['{specific_tool}'],
    description: 'Specific tool evaluation',
  },
  {
    category: 'review',
    template: 'is {specific_tool} worth it',
    variables: ['{specific_tool}'],
    description: 'Value assessment query',
  },

  // Trend & Innovation Queries
  {
    category: 'trend',
    template: 'AI-powered {category} tools',
    variables: ['{category}'],
    description: 'AI innovation search',
  },
  {
    category: 'trend',
    template: 'newest {category} startups',
    variables: ['{category}'],
    description: 'Startup discovery search',
  },
  {
    category: 'trend',
    template: 'emerging {category} technologies',
    variables: ['{category}'],
    description: 'Emerging tech search',
  },
  {
    category: 'trend',
    template: 'future of {category} software',
    variables: ['{category}'],
    description: 'Future trends query',
  },
  {
    category: 'trend',
    template: 'innovative {category} solutions 2024',
    variables: ['{category}'],
    description: 'Innovation-focused search',
  },
];

export async function seedDatabase() {
  console.log('Seeding database with query templates...');
  
  try {
    // Insert query templates
    await db.insert(queryTemplates).values(saasQueryTemplates);
    
    console.log(`✅ Inserted ${saasQueryTemplates.length} query templates`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}