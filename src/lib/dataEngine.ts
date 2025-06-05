// src/lib/dataEngine.ts
import { 
  IndustryDataMap, 
  Software, 
  AnalysisResult, 
  Recommendation, 
  IntegrationData, 
  IntegrationOpportunity,
  IntegrationMatrix 
} from '@/types';
import industryData from '@/data/industry-ui.json';
import integrationData from '@/data/integration-data.json';

// Type-safe data casting
const typedIndustryData = industryData as IndustryDataMap;
const typedIntegrationData = integrationData as IntegrationData;

export function getIndustries(): string[] {
  return Object.keys(typedIndustryData).sort();
}

// Helper function to find matching software names between industry and integration data
function findSoftwareMatch(softwareName: string): string | null {
  // Direct match first
  if (typedIntegrationData[softwareName]) {
    return softwareName;
  }
  
  // Try common variations and partial matches
  const variations = [
    softwareName.replace(/\s+/g, ''), // Remove spaces
    softwareName.replace(/\s+/g, ' '), // Normalize spaces
    softwareName.trim(),
  ];
  
  for (const variation of variations) {
    if (typedIntegrationData[variation]) {
      return variation;
    }
  }
  
  // Try partial matches (case insensitive)
  const softwareKeys = Object.keys(typedIntegrationData);
  for (const key of softwareKeys) {
    if (key.toLowerCase().includes(softwareName.toLowerCase()) ||
        softwareName.toLowerCase().includes(key.toLowerCase())) {
      return key;
    }
  }
  
  return null;
}

// Basic function to get software by industry (for backward compatibility)
export function getSoftwareByIndustry(industry: string): Software[] {
  const data = typedIndustryData[industry];
  return data?.software || [];
}

// Enhanced function to get software with real integration counts
export function getSoftwareByIndustryWithIntegrations(industry: string): (Software & { integration_count: number })[] {
  const data = typedIndustryData[industry];
  if (!data?.software) return [];
  
  return data.software.map(software => {
    const matchedName = findSoftwareMatch(software.name);
    const integrationData = matchedName ? typedIntegrationData[matchedName] : null;
    
    return {
      ...software,
      integration_count: integrationData?.integrates_with?.length || 0
    };
  });
}

export function getFrictionsByIndustry(industry: string): string[] {
  const data = typedIndustryData[industry];
  return data?.pain_points?.frictions || [];
}

// New function to find real integration opportunities using your data
export function findIntegrationOpportunities(selectedSoftware: string[]): {
  missing: IntegrationOpportunity[];
  existing: IntegrationOpportunity[];
  quickWins: IntegrationOpportunity[];
} {
  const missing: IntegrationOpportunity[] = [];
  const existing: IntegrationOpportunity[] = [];
  const quickWins: IntegrationOpportunity[] = [];

  // Check all possible integrations between selected software
  for (let i = 0; i < selectedSoftware.length; i++) {
    for (let j = i + 1; j < selectedSoftware.length; j++) {
      const softwareA = selectedSoftware[i];
      const softwareB = selectedSoftware[j];
      
      // Find matches in integration data
      const matchedA = findSoftwareMatch(softwareA);
      const matchedB = findSoftwareMatch(softwareB);
      
      // Look up software A in your integration data
      const softwareAData = matchedA ? typedIntegrationData[matchedA] : null;
      const softwareBData = matchedB ? typedIntegrationData[matchedB] : null;
      
      // Check if they integrate with each other (with null safety)
      const aIntegratesWithB = softwareAData?.integrates_with?.includes(matchedB || softwareB) || false;
      const bIntegratesWithA = softwareBData?.integrates_with?.includes(matchedA || softwareA) || false;
      
      const integrationExists: boolean = aIntegratesWithB || bIntegratesWithA;

      const integration: IntegrationOpportunity = {
        software_a: softwareA,
        software_b: softwareB,
        integration_exists: integrationExists,
        difficulty: integrationExists ? 'Easy' : 'Medium',
        estimated_setup_time: integrationExists ? '1-2 weeks' : '3-4 weeks',
        benefits: integrationExists 
          ? ['Eliminate duplicate data entry', 'Real-time data sync', 'Improved workflow efficiency']
          : ['Potential data sync', 'Reduced manual work', 'Better reporting']
      };

      if (integrationExists) {
        existing.push(integration);
        
        // Mark as quick win if both software are commonly used in the industry
        const isQuickWin = (softwareAData?.verified && softwareBData?.verified) || 
                          ((softwareAData?.integrates_with?.length || 0) > 5);
        if (isQuickWin) {
          quickWins.push(integration);
        }
      } else {
        missing.push(integration);
      }
    }
  }

  return { missing, existing, quickWins };
}

// Enhanced analysis with real integration data
export function analyzeIndustry(industry: string, companySize?: string, selectedSoftware: string[] = []): AnalysisResult {
  // Use the basic software list for the analysis result
  const software = getSoftwareByIndustry(industry);
  const integrationOpportunities = findIntegrationOpportunities(selectedSoftware);
  const recommendations = generateRecommendations(software, companySize, integrationOpportunities);
  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.estimated_savings, 0);

  return {
    industry,
    current_stack: software,
    recommendations,
    total_savings: totalSavings,
    integration_opportunities: {
      missing_integrations: integrationOpportunities.missing,
      existing_integrations: integrationOpportunities.existing,
      quick_wins: integrationOpportunities.quickWins
    }
  };
}

function generateRecommendations(
  software: Software[], 
  companySize?: string, 
  integrationOps?: { missing: IntegrationOpportunity[]; existing: IntegrationOpportunity[]; quickWins: IntegrationOpportunity[]; }
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Company size multipliers for savings estimates
  const sizeMultiplier = {
    '1-50': 1,
    '51-200': 2.5,
    '200+': 5
  };
  
  const multiplier = companySize ? sizeMultiplier[companySize as keyof typeof sizeMultiplier] || 1 : 1;

  // REAL INTEGRATION RECOMMENDATIONS from your data
  if (integrationOps?.quickWins && integrationOps.quickWins.length > 0) {
    integrationOps.quickWins.forEach((integration, index) => {
      const baseSavings = 15000;
      recommendations.push({
        id: `quick-win-${index}`,
        title: `Quick Win: ${integration.software_a} ↔ ${integration.software_b} Integration`,
        description: `This integration is marked as "${integration.difficulty}" difficulty and can be completed in ${integration.estimated_setup_time}. Benefits include: ${integration.benefits.join(', ')}.`,
        priority: 'High',
        category: 'Quick Win Integration',
        estimated_savings: Math.round(baseSavings * multiplier),
        software_involved: [integration.software_a, integration.software_b],
        integration_details: {
          difficulty: integration.difficulty,
          setup_time: integration.estimated_setup_time,
          middleware_required: !integration.integration_exists,
          specific_benefits: integration.benefits
        }
      });
    });
  }

  // MISSING INTEGRATION OPPORTUNITIES
  if (integrationOps?.missing && integrationOps.missing.length > 0) {
    integrationOps.missing.slice(0, 3).forEach((integration, index) => {
      const baseSavings = 8000;
      recommendations.push({
        id: `missing-integration-${index}`,
        title: `Integration Opportunity: ${integration.software_a} ↔ ${integration.software_b}`,
        description: companySize === '1-50' 
          ? `These tools aren't talking to each other, causing manual data entry. For small companies, even basic integration can save 3-5 hours weekly.`
          : companySize === '51-200'
          ? `Missing integration between these systems is creating inefficiencies across multiple team members. Integration can eliminate duplicate work.`
          : `This integration gap is causing enterprise-level inefficiencies. Proper API connection can streamline operations across departments.`,
        priority: 'Medium',
        category: 'Integration Gap',
        estimated_savings: Math.round(baseSavings * multiplier),
        software_involved: [integration.software_a, integration.software_b],
        integration_details: {
          difficulty: integration.difficulty,
          setup_time: integration.estimated_setup_time,
          middleware_required: !integration.integration_exists,
          specific_benefits: integration.benefits
        }
      });
    });
  }

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
  }

  // Universal VoIP/UCaaS recommendation
  recommendations.push({
    id: 'communication-upgrade',
    title: companySize === '1-50' ? 'Cloud Phone System' :
           companySize === '51-200' ? 'Unified Communications Platform' :
           'Enterprise Communication Infrastructure',
    description: companySize === '1-50'
      ? 'Replace traditional phone systems with cloud-based VoIP. No hardware maintenance, built-in features like CRM integration.'
      : companySize === '51-200'
      ? 'Integrate voice, video, messaging, and collaboration tools. UCaaS platforms eliminate communication silos and integrate with your existing software stack.'
      : 'Deploy enterprise-grade communication infrastructure with AI-powered features, global redundancy, and deep integrations with your business applications.',
    priority: 'Medium',
    category: 'Communication',
    estimated_savings: companySize === '1-50' ? 8000 : companySize === '51-200' ? 18000 : 35000,
    software_involved: companySize === '1-50' ? ['Cloud VoIP'] : companySize === '51-200' ? ['UCaaS Platform'] : ['Enterprise Communications']
  });

  // Sort by priority and potential savings
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.estimated_savings - a.estimated_savings;
  });
}

// New function to create integration matrix for visual display
export function createIntegrationMatrix(selectedSoftware: string[]): IntegrationMatrix {
  const matrix: IntegrationMatrix = {};

  selectedSoftware.forEach(software => {
    const matchedName = findSoftwareMatch(software);
    const softwareData = matchedName ? typedIntegrationData[matchedName] : null;
    
    if (softwareData) {
      const integratesWith = (softwareData.integrates_with || []).filter(s => selectedSoftware.includes(s));
      const missingConnections = selectedSoftware.filter(other => 
        other !== software && !(softwareData.integrates_with || []).includes(other)
      );

      const potentialIntegrations: IntegrationOpportunity[] = missingConnections.map(missingSoftware => ({
        software_a: software,
        software_b: missingSoftware,
        integration_exists: false,
        difficulty: 'Medium',
        estimated_setup_time: '3-4 weeks',
        benefits: ['Data synchronization', 'Workflow automation']
      }));

      matrix[software] = {
        integrates_with: integratesWith,
        missing_connections: missingConnections,
        potential_integrations: potentialIntegrations
      };
    }
  });

  return matrix;
}