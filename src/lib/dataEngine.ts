// src/lib/dataEngine.ts
import { 
  IndustryDataMap, 
  Software, 
  AnalysisResult, 
  Recommendation, 
  IntegrationData, 
  IntegrationOpportunity,
  IntegrationMatrix,
  IntegrationStatus 
} from '@/types';
import { AIIntegrationAnalysis } from './aiService';
import industryData from '@/data/industry-ui.json';
import integrationData from '@/data/integration-data.json';
// import faultToleranceData from '@/data/fault-tolerance.json';

// Type-safe data casting
const typedIndustryData = industryData as IndustryDataMap;
const typedIntegrationData = integrationData as IntegrationData;
// const typedFaultTolerance = faultToleranceData as {
//   name_variations: Record<string, { variants: string[] }>;
//   industry_mappings: Record<string, {
//     keywords: string[];
//     required_software: string[];
//     common_software: string[];
//   }>;
// };

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

// Enhanced function to find real integration opportunities using your data
export function findIntegrationOpportunities(
  selectedSoftware: string[],
  integrationStatuses?: Record<string, IntegrationStatus>
): {
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

      // Check if user already has this integration active
      const statusA = integrationStatuses?.[softwareA];
      const statusB = integrationStatuses?.[softwareB];
      const alreadyIntegrated = (statusA?.activeIntegrations?.includes(softwareB) || 
                                statusB?.activeIntegrations?.includes(softwareA)) || false;

      const integration: IntegrationOpportunity = {
        software_a: softwareA,
        software_b: softwareB,
        integration_exists: integrationExists,
        difficulty: integrationExists ? 'Easy' : 'Medium',
        estimated_setup_time: integrationExists ? '1-2 weeks' : '3-4 weeks',
        benefits: integrationExists 
          ? ['Eliminate duplicate data entry', 'Real-time data sync', 'Improved workflow efficiency']
          : ['Potential data sync', 'Reduced manual work', 'Better reporting'],
        already_integrated: alreadyIntegrated
      };

      if (alreadyIntegrated) {
        // Don't add to opportunities if already integrated
        continue;
      } else if (integrationExists) {
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

// Enhanced analysis with real integration data and integration status awareness
export function analyzeIndustry(
  industry: string, 
  companySize?: string, 
  selectedSoftware: string[] = [],
  integrationStatuses?: Record<string, IntegrationStatus>
): AnalysisResult {
  // Use ACTUAL selected software instead of static industry data
  const softwareWithIntegrations = selectedSoftware.map(softwareName => {
    const matchedName = findSoftwareMatch(softwareName);
    const integrationData = matchedName ? typedIntegrationData[matchedName] : null;
    
    return {
      name: softwareName,
      main_functions: integrationData?.main_functions || ['Business Software'],
      integrates_with: integrationData?.integrates_with || [],
      verified: integrationData?.verified || false,
      best_used_for_industries: integrationData?.best_used_for_industries || []
    };
  });

  const integrationOpportunities = findIntegrationOpportunities(selectedSoftware, integrationStatuses);
  const recommendations = generateRecommendations(
    softwareWithIntegrations as Software[], 
    companySize, 
    integrationOpportunities,
    integrationStatuses
  );
  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.estimated_savings, 0);

  return {
    industry,
    current_stack: softwareWithIntegrations as Software[],
    recommendations,
    total_savings: totalSavings,
    integration_opportunities: {
      missing_integrations: integrationOpportunities.missing,
      existing_integrations: integrationOpportunities.existing,
      quick_wins: integrationOpportunities.quickWins
    }
  };
}

// Enhanced analysis with AI integration
export async function analyzeIndustryWithAI(
  industry: string, 
  companySize?: string, 
  selectedSoftware: string[] = [],
  integrationStatuses?: Record<string, IntegrationStatus>,
  customSoftware: string[] = [],
  painPoints: string[] = []
): Promise<AnalysisResult & { aiInsights?: AIIntegrationAnalysis }> {
  
  // Start with your existing logic
  const baseAnalysis = analyzeIndustry(industry, companySize, selectedSoftware, integrationStatuses);
  
  // If no OpenAI key, return base analysis
  
  try {
    // Call AI analysis API
    const response = await fetch('/api/analyze-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedSoftware,
        customSoftware,
        industry,
        painPoints,
        companySize
      })
    });

    if (!response.ok) {
      console.error('AI API call failed:', response.statusText);
      return baseAnalysis;
    }

    const aiResult = await response.json();
    
    if (!aiResult.success) {
      console.error('AI analysis failed:', aiResult.error);
      return baseAnalysis;
    }

    const aiInsights: AIIntegrationAnalysis = aiResult.data;

    // Enhance recommendations with AI insights
    const enhancedRecommendations = generateAIEnhancedRecommendations(
      baseAnalysis.recommendations,
      aiInsights,
      companySize,
      selectedSoftware
    );

    return {
      ...baseAnalysis,
      recommendations: enhancedRecommendations,
      aiInsights
    };

  } catch (error) {
    console.error('AI analysis error:', error);
    return baseAnalysis;
  }
}

function generateRecommendations(
  software: Software[],
  companySize?: string, 
  integrationOps?: { missing: IntegrationOpportunity[]; existing: IntegrationOpportunity[]; quickWins: IntegrationOpportunity[]; },
  integrationStatuses?: Record<string, IntegrationStatus>
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Company size multipliers for savings estimates
  const sizeMultiplier = {
    '1-50': 1,
    '51-200': 2.5,
    '200+': 5
  };
  
  const multiplier = companySize ? sizeMultiplier[companySize as keyof typeof sizeMultiplier] || 1 : 1;

  // Add current value insights for integrated software
  if (integrationStatuses) {
    Object.entries(integrationStatuses).forEach(([softwareName, status]) => {
      if (status.isIntegrated && status.activeIntegrations.length > 0) {
        const currentValue = status.activeIntegrations.length * 2000 * multiplier; // Base value per integration
        recommendations.push({
          id: `current-value-${softwareName.toLowerCase().replace(/\s+/g, '-')}`,
          title: `✅ Current Value: ${softwareName} Integration`,
          description: `Great news! Your ${softwareName} integration is already delivering value. Active integrations: ${status.activeIntegrations.join(', ')}. You're saving approximately $${currentValue.toLocaleString()}/year in reduced manual work and improved efficiency.`,
          priority: 'High',
          category: 'Current Value',
          estimated_savings: 0, // Don't show as additional savings since they already have it
          software_involved: [softwareName],
          integration_details: {
            difficulty: 'Already Complete',
            setup_time: 'Active',
            middleware_required: false,
            specific_benefits: ['Currently saving time', 'Eliminating manual data entry', 'Improving accuracy']
          }
        });

        // Check for expansion opportunities within this software
        const unusedIntegrations = status.availableIntegrations.filter(
          integration => !status.activeIntegrations.includes(integration)
        );
        
        if (unusedIntegrations.length > 0) {
          const expansionValue = unusedIntegrations.length * 1500 * multiplier;
          recommendations.push({
            id: `expansion-${softwareName.toLowerCase().replace(/\s+/g, '-')}`,
            title: `📈 Expansion Opportunity: ${softwareName}`,
            description: `You have untapped potential in ${softwareName}. Consider activating these unused integrations: ${unusedIntegrations.slice(0, 3).join(', ')}${unusedIntegrations.length > 3 ? ` and ${unusedIntegrations.length - 3} more` : ''}. This could add $${expansionValue.toLocaleString()}/year in additional value.`,
            priority: 'Medium',
            category: 'Expansion Opportunity',
            estimated_savings: expansionValue,
            software_involved: [softwareName],
            integration_details: {
              difficulty: 'Easy',
              setup_time: '1-2 weeks',
              middleware_required: false,
              specific_benefits: ['Expand current automation', 'Additional time savings', 'Enhanced workflow']
            }
          });
        }
      }
    });
  }

  // REAL INTEGRATION RECOMMENDATIONS from your data (only for non-integrated)
  if (integrationOps?.quickWins && integrationOps.quickWins.length > 0) {
    integrationOps.quickWins.forEach((integration, index) => {
      const baseSavings = 15000;
      recommendations.push({
        id: `quick-win-${index}`,
        title: `🚀 Quick Win: ${integration.software_a} ↔ ${integration.software_b} Integration`,
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

  // MISSING INTEGRATION OPPORTUNITIES (only for non-integrated)
  if (integrationOps?.missing && integrationOps.missing.length > 0) {
    integrationOps.missing.slice(0, 3).forEach((integration, index) => {
      const baseSavings = 8000;
      recommendations.push({
        id: `missing-integration-${index}`,
        title: `🔗 Integration Opportunity: ${integration.software_a} ↔ ${integration.software_b}`,
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

  // Company size-specific recommendations (only if not already covered by existing integrations)
  if (companySize === '1-50') {
    recommendations.push({
      id: 'small-business-automation',
      title: '⚡ Small Business Automation Package',
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
      title: '🏢 Mid-Market Integration Hub',
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
      title: '🏛️ Enterprise API Management',
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
    title: companySize === '1-50' ? '☎️ Cloud Phone System' :
           companySize === '51-200' ? '💬 Unified Communications Platform' :
           '📞 Enterprise Communication Infrastructure',
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

  // Sort by category priority (Current Value first), then by priority and potential savings
  return recommendations.sort((a, b) => {
    // Category priority order
    const categoryOrder = { 
      'Current Value': 5, 
      'Expansion Opportunity': 4,
      'Quick Win Integration': 3, 
      'Integration Gap': 2, 
      'Automation': 1,
      'Integration': 1,
      'Communication': 0 
    };
    
    const categoryDiff = (categoryOrder[b.category as keyof typeof categoryOrder] || 0) - 
                        (categoryOrder[a.category as keyof typeof categoryOrder] || 0);
    if (categoryDiff !== 0) return categoryDiff;
    
    // Then by priority
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Finally by savings
    return b.estimated_savings - a.estimated_savings;
  });
}

// Generate AI-enhanced recommendations
function generateAIEnhancedRecommendations(
  baseRecommendations: Recommendation[],
  aiInsights: AIIntegrationAnalysis,
  companySize?: string,
  selectedSoftware: string[] = []
): Recommendation[] {
  
  const enhancedRecommendations: Recommendation[] = [];
  const sizeMultiplier = {
    '1-50': 1,
    '51-200': 2.5,
    '200+': 5
  };
  const multiplier = companySize ? sizeMultiplier[companySize as keyof typeof sizeMultiplier] || 1 : 1;

  // 1. Add AI contextual recommendations first (highest priority)
  aiInsights.contextualRecommendations.forEach((recommendation, index) => {
    enhancedRecommendations.push({
      id: `ai-contextual-${index}`,
      title: `🤖 Smart Insight: ${recommendation.split(':')[0] || 'AI Recommendation'}`,
      description: recommendation,
      priority: 'High',
      category: 'AI Insight',
      estimated_savings: Math.round(8000 * multiplier),
      software_involved: selectedSoftware.slice(0, 2), // Most relevant software
      integration_details: {
        difficulty: 'Smart',
        setup_time: 'AI-optimized',
        middleware_required: false,
        specific_benefits: ['AI-powered optimization', 'Contextual integration', 'Intelligent automation']
      }
    });
  });

  // 2. Add custom software insights
  aiInsights.customSoftwareInsights.forEach((insight, index) => {
    if (insight.suggestedIntegrations.length > 0) {
      enhancedRecommendations.push({
        id: `ai-custom-${index}`,
        title: `🔗 ${insight.softwareName} Integration Opportunities`,
        description: `Your ${insight.softwareName} (${insight.category}) can integrate with: ${insight.suggestedIntegrations.join(', ')}. ${insight.industryRelevance}`,
        priority: 'Medium',
        category: 'Custom Software',
        estimated_savings: Math.round(5000 * multiplier),
        software_involved: [insight.softwareName, ...insight.suggestedIntegrations.slice(0, 2)],
        integration_details: {
          difficulty: 'Medium',
          setup_time: '2-3 weeks',
          middleware_required: true,
          specific_benefits: ['Custom software optimization', 'Improved data flow', 'Enhanced productivity']
        }
      });
    }
  });

  // 3. Filter base recommendations to avoid VoIP conflicts
  const filteredBaseRecommendations = baseRecommendations.filter(rec => {
    // If AI detected VoIP, filter out VoIP recommendations
    if (aiInsights.hasVoIP && rec.category === 'Communication') {
      return false;
    }
    return true;
  });

  // 4. Add VoIP integration recommendation if they have VoIP
  if (aiInsights.hasVoIP && aiInsights.voipProvider) {
    enhancedRecommendations.push({
      id: 'ai-voip-integration',
      title: `📞 Maximize ${aiInsights.voipProvider} Integration`,
      description: `You're already using ${aiInsights.voipProvider} for communications. Let's optimize its integration with your CRM and business tools for call logging, contact sync, and workflow automation.`,
      priority: 'High',
      category: 'VoIP Integration',
      estimated_savings: Math.round(12000 * multiplier),
      software_involved: [aiInsights.voipProvider, ...selectedSoftware.slice(0, 2)],
      integration_details: {
        difficulty: 'Easy',
        setup_time: '1-2 weeks',
        middleware_required: false,
        specific_benefits: ['Call logging automation', 'Contact synchronization', 'Click-to-dial functionality']
      }
    });
  }

  // 5. Add filtered base recommendations
  enhancedRecommendations.push(...filteredBaseRecommendations);

  // 6. Sort by priority and AI insights first
  return enhancedRecommendations.sort((a, b) => {
    // AI insights first
    const aIsAI = a.category === 'AI Insight';
    const bIsAI = b.category === 'AI Insight';
    if (aIsAI && !bIsAI) return -1;
    if (!aIsAI && bIsAI) return 1;

    // Then by priority
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Finally by savings
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