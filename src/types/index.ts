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

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  estimated_savings: number;
  software_involved: string[];
}

export interface AnalysisResult {
  industry: string;
  current_stack: Software[];
  recommendations: Recommendation[];
  total_savings: number;
}