// src/types/index.ts
// Type definitions for AdvisorPilot 2.0

export interface Software {
  name: string;
  integrates_with: string[];
  main_functions: string[];
  best_used_for_industries: string[];
}

export interface IndustryData {
  software: Software[];
  pain_points: {
    frictions: string[];
  };
}

export interface IndustryDataMap {
  [industryName: string]: IndustryData;
}

// Integration types matching your actual data structure
export interface SoftwareDetail {
  integrates_with: string[];
  main_functions: string[];
  best_used_for_industries: string[];
  verified: boolean;
}

export interface IntegrationData {
  [softwareName: string]: SoftwareDetail;
}

export interface IntegrationOpportunity {
  software_a: string;
  software_b: string;
  integration_exists: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimated_setup_time: string;
  benefits: string[];
}

// Enhanced recommendation with integration details
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  estimated_savings: number;
  software_involved: string[];
  integration_details?: {
    difficulty: string;
    setup_time: string;
    middleware_required: boolean;
    specific_benefits: string[];
  };
}

export interface AnalysisResult {
  industry: string;
  current_stack: Software[];
  recommendations: Recommendation[];
  total_savings: number;
  integration_opportunities: {
    missing_integrations: IntegrationOpportunity[];
    existing_integrations: IntegrationOpportunity[];
    quick_wins: IntegrationOpportunity[];
  };
}

// Integration matrix for visual display
export interface IntegrationMatrix {
  [softwareName: string]: {
    integrates_with: string[];
    missing_connections: string[];
    potential_integrations: IntegrationOpportunity[];
  };
}