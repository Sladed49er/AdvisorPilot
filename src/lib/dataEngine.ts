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

export function analyzeIndustry(industry: string): AnalysisResult {
  const software = getSoftwareByIndustry(industry);
  const recommendations = generateRecommendations(software);
  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.estimated_savings, 0);

  return {
    industry,
    current_stack: software,
    recommendations,
    total_savings: totalSavings
  };
}

function generateRecommendations(software: Software[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Find integration opportunities
  software.forEach((app, index) => {
    if (app.integrates_with.length < 2) {
      recommendations.push({
        id: `integration-${index}`,
        title: `Improve ${app.name} Integration`,
        description: `${app.name} has limited integrations. Consider connecting it with your CRM or communication tools.`,
        priority: 'Medium',
        category: 'Integration',
        estimated_savings: Math.floor(Math.random() * 15000) + 5000,
        software_involved: [app.name]
      });
    }
  });

  // Look for cost optimization opportunities
  if (software.length > 5) {
    recommendations.push({
      id: 'consolidation',
      title: 'Software Consolidation Opportunity',
      description: 'You have multiple tools that might overlap in functionality. Consider consolidating to reduce costs.',
      priority: 'High',
      category: 'Cost Optimization',
      estimated_savings: Math.floor(Math.random() * 25000) + 10000,
      software_involved: software.slice(0, 3).map(s => s.name)
    });
  }

  // Security recommendation
  recommendations.push({
    id: 'security',
    title: 'Enhanced Security Framework',
    description: 'Implement single sign-on (SSO) and multi-factor authentication across all platforms.',
    priority: 'High',
    category: 'Security',
    estimated_savings: 8000,
    software_involved: ['SSO Provider']
  });

  return recommendations;
}