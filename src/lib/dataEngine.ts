// src/lib/dataEngine.ts
import { IndustryDataMap, Software, AnalysisResult, Recommendation } from '@/types';
import industryData from '@/data/industry-ui.json';

// Type-safe data casting
const typedIndustryData = industryData as IndustryDataMap;

export function getIndustries(): string[] {
  return Object.keys(typedIndustryData);
}

export function getSoftwareByIndustry(industry: string): Software[] {
  const data = typedIndustryData[industry];
  return data?.software || [];
}

export function getFrictionsByIndustry(industry: string): string[] {
  const data = typedIndustryData[industry];
  return data?.pain_points?.frictions || [];
}

export function analyzeIndustry(industry: string, companySize?: string): AnalysisResult {
  const software = getSoftwareByIndustry(industry);
  const recommendations = generateRecommendations(software, companySize);
  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.estimated_savings, 0);

  return {
    industry,
    current_stack: software,
    recommendations,
    total_savings: totalSavings
  };
}

function generateRecommendations(software: Software[], companySize?: string): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Company size multipliers for savings estimates
  const sizeMultiplier = {
    '1-50': 1,
    '51-200': 2.5,
    '200+': 5
  };
  
  const multiplier = companySize ? sizeMultiplier[companySize as keyof typeof sizeMultiplier] || 1 : 1;

  // Find integration opportunities
  software.forEach((app, index) => {
    if (app.integrates_with.length < 2) {
      const baseSavings = Math.floor(Math.random() * 15000) + 5000;
      recommendations.push({
        id: `integration-${index}`,
        title: `Improve ${app.name} Integration`,
        description: companySize === '1-50' 
          ? `${app.name} has limited integrations. For small companies, connecting it with your CRM can eliminate 5-10 hours of manual work weekly.`
          : companySize === '51-200'
          ? `${app.name} needs better integration. For growing companies, this integration can save multiple team members significant time daily.`
          : `${app.name} integration gaps are costing enterprise-level efficiency. Proper API connections can eliminate redundant data entry across departments.`,
        priority: companySize === '200+' ? 'High' : 'Medium',
        category: 'Integration',
        estimated_savings: Math.round(baseSavings * multiplier),
        software_involved: [app.name]
      });
    }
  });

  // Company size-specific recommendations
  if (companySize === '1-50') {
    recommendations.push({
      id: 'small-business-automation',
      title: 'Small Business Automation Package',
      description: 'For companies your size, focus on automating repetitive tasks first. Zapier integrations can connect your tools without expensive custom development.',
      priority: 'High',
      category: 'Automation',
      estimated_savings: Math.round(12000 * multiplier),
      software_involved: ['Zapier', 'Automation Tools']
    });

    recommendations.push({
      id: 'small-business-backup',
      title: 'Essential Data Protection',
      description: 'Small businesses need simple, reliable backup. Cloud-based solutions can protect your data without IT staff.',
      priority: 'Medium',
      category: 'Security',
      estimated_savings: Math.round(5000 * multiplier),
      software_involved: ['Cloud Backup']
    });

    recommendations.push({
      id: 'small-business-voip',
      title: 'Modern Communication System',
      description: 'Small companies benefit from cloud-based VoIP systems that grow with you. No hardware to maintain.',
      priority: 'Medium',
      category: 'Communication',
      estimated_savings: Math.round(8000 * multiplier),
      software_involved: ['Cloud VoIP']
    });
  }

  if (companySize === '51-200') {
    recommendations.push({
      id: 'mid-market-integration',
      title: 'Mid-Market Integration Hub',
      description: 'Growing companies benefit from a central integration platform. This eliminates data silos as you scale.',
      priority: 'High',
      category: 'Integration',
      estimated_savings: Math.round(25000 * multiplier),
      software_involved: ['Integration Platform']
    });

    recommendations.push({
      id: 'workflow-optimization',
      title: 'Department Workflow Optimization',
      description: 'At your company size, department-specific automations can save 2-3 hours per employee weekly.',
      priority: 'Medium',
      category: 'Efficiency',
      estimated_savings: Math.round(18000 * multiplier),
      software_involved: ['Workflow Tools']
    });

    recommendations.push({
      id: 'mid-market-ucaas',
      title: 'Unified Communications Platform',
      description: 'Growing teams need integrated voice, video, and messaging. UCaaS platforms eliminate communication silos.',
      priority: 'High',
      category: 'Communication',
      estimated_savings: Math.round(22000 * multiplier),
      software_involved: ['UCaaS Platform']
    });
  }

  if (companySize === '200+') {
    recommendations.push({
      id: 'enterprise-api-strategy',
      title: 'Enterprise API Management',
      description: 'Large organizations need robust API management to prevent data fragmentation. A unified API strategy can transform operations.',
      priority: 'High',
      category: 'Integration',
      estimated_savings: Math.round(75000 * multiplier),
      software_involved: ['API Management Platform']
    });

    recommendations.push({
      id: 'enterprise-automation',
      title: 'Enterprise Process Automation',
      description: 'Companies your size can achieve massive efficiencies through RPA and AI-powered automation across multiple departments.',
      priority: 'High',
      category: 'Automation',
      estimated_savings: Math.round(150000 * multiplier),
      software_involved: ['RPA Platform', 'AI Tools']
    });

    recommendations.push({
      id: 'compliance-framework',
      title: 'Enterprise Compliance Framework',
      description: 'Large companies need automated compliance monitoring and reporting across all systems to reduce audit risks.',
      priority: 'Medium',
      category: 'Compliance',
      estimated_savings: Math.round(45000 * multiplier),
      software_involved: ['Compliance Platform']
    });

    recommendations.push({
      id: 'enterprise-ccaas',
      title: 'Enterprise Contact Center Solution',
      description: 'Large organizations need sophisticated CCaaS platforms with AI-powered routing, analytics, and omnichannel support.',
      priority: 'High',
      category: 'Communication',
      estimated_savings: Math.round(85000 * multiplier),
      software_involved: ['CCaaS Platform', 'AI Analytics']
    });
  }

  // Look for cost optimization opportunities
  if (software.length > 5) {
    const baseSavings = Math.floor(Math.random() * 25000) + 10000;
    recommendations.push({
      id: 'consolidation',
      title: companySize === '1-50' ? 'Software Consolidation - Small Business Focus' : 
             companySize === '51-200' ? 'Strategic Software Consolidation' : 
             'Enterprise License Optimization',
      description: companySize === '1-50'
        ? 'Small businesses often have overlapping tools. Consolidating can reduce both costs and complexity.'
        : companySize === '51-200' 
        ? 'Growing companies can achieve significant savings by consolidating overlapping functionality into integrated platforms.'
        : 'Enterprise license consolidation and vendor negotiations can yield substantial savings while improving functionality.',
      priority: 'High',
      category: 'Cost Optimization',
      estimated_savings: Math.round(baseSavings * multiplier),
      software_involved: software.slice(0, 3).map(s => s.name)
    });
  }

  // Universal security recommendation (scaled by company size)
  const securitySavings = companySize === '1-50' ? 8000 : companySize === '51-200' ? 20000 : 50000;
  recommendations.push({
    id: 'security',
    title: companySize === '1-50' ? 'Essential Security Package' :
           companySize === '51-200' ? 'Growing Business Security Framework' :
           'Enterprise Security Architecture',
    description: companySize === '1-50'
      ? 'Small businesses need basic but effective security. Focus on MFA, backup, and employee training.'
      : companySize === '51-200'
      ? 'Growing companies need scalable security. Implement SSO, advanced threat protection, and security awareness programs.'
      : 'Enterprise security requires comprehensive frameworks including zero-trust architecture, advanced threat detection, and compliance automation.',
    priority: 'High',
    category: 'Security',
    estimated_savings: securitySavings,
    software_involved: ['Security Platform']
  });

  // Industry-specific VoIP/UCaaS recommendations
  recommendations.push({
    id: 'voip-upgrade',
    title: companySize === '1-50' ? 'Cloud Phone System' :
           companySize === '51-200' ? 'Unified Communications Upgrade' :
           'Enterprise Communication Infrastructure',
    description: companySize === '1-50'
      ? 'Replace traditional phone systems with cloud-based VoIP. No hardware maintenance, built-in features.'
      : companySize === '51-200'
      ? 'Integrate voice, video, messaging, and collaboration tools into one platform for seamless communication.'
      : 'Deploy enterprise-grade communication infrastructure with AI-powered features, global redundancy, and advanced analytics.',
    priority: 'Medium',
    category: 'Communication',
    estimated_savings: companySize === '1-50' ? 6000 : companySize === '51-200' ? 15000 : 35000,
    software_involved: companySize === '1-50' ? ['Cloud VoIP'] : companySize === '51-200' ? ['UCaaS Platform'] : ['Enterprise Communications']
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}