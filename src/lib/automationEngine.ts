// src/lib/automationEngine.ts
import { IntegrationData } from '@/types';
import integrationData from '@/data/integration-data.json';

// Cast to proper type - your JSON is an object with software names as keys
const typedIntegrationData = integrationData as {[softwareName: string]: any};

// Known automation platforms
const AUTOMATION_PLATFORMS = [
  'Zapier',
  'Make',
  'Microsoft Power Automate',
  'Integromat',
  'IFTTT',
  'Workato',
  'Nintex',
  'ProcessStreet',
  'Monday.com Automations',
  'Airtable Automations',
  'HubSpot Workflows',
  'Salesforce Flow',
  'Pipedrive Automations'
];

export interface AutomationOpportunity {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimated_savings: number;
  setup_time: string;
  software_involved: string[];
  workflow_steps: string[];
  category: 'Data Sync' | 'Lead Management' | 'Reporting' | 'Communication' | 'Document Management';
}

export interface AutomationAnalysis {
  has_automation_platform: boolean;
  detected_platforms: string[];
  missing_platforms: string[];
  automation_opportunities: AutomationOpportunity[];
  potential_annual_savings: number;
  automation_maturity_score: number; // 0-100
}

export function detectAutomationPlatforms(selectedSoftware: string[]): {
  detected: string[];
  missing: string[];
} {
  const detected = selectedSoftware.filter(software => 
    AUTOMATION_PLATFORMS.some(platform => 
      software.toLowerCase().includes(platform.toLowerCase())
    )
  );

  const missing = AUTOMATION_PLATFORMS.filter(platform =>
    !selectedSoftware.some(software =>
      software.toLowerCase().includes(platform.toLowerCase())
    )
  );

  return { detected, missing };
}

export function generateAutomationOpportunities(
  selectedSoftware: string[],
  companySize?: string,
  employeeCount?: number
): AutomationOpportunity[] {
  const opportunities: AutomationOpportunity[] = [];
  
  // Company size multiplier for savings
  const sizeMultiplier = employeeCount ? Math.max(1, employeeCount / 50) : 1;
  
  // Check for common software combinations that can be automated
  const hasHubSpot = selectedSoftware.some(s => s.toLowerCase().includes('hubspot'));
  const hasSalesforce = selectedSoftware.some(s => s.toLowerCase().includes('salesforce'));
  const hasSlack = selectedSoftware.some(s => s.toLowerCase().includes('slack'));
  const hasGmail = selectedSoftware.some(s => s.toLowerCase().includes('gmail') || s.toLowerCase().includes('outlook'));
  const hasCalendly = selectedSoftware.some(s => s.toLowerCase().includes('calendly'));
  const hasAirtable = selectedSoftware.some(s => s.toLowerCase().includes('airtable'));
  const hasSheets = selectedSoftware.some(s => s.toLowerCase().includes('sheets') || s.toLowerCase().includes('excel'));

  // Lead Management Automation
  if ((hasHubSpot || hasSalesforce) && hasGmail) {
    opportunities.push({
      id: 'lead-email-automation',
      title: 'Automated Lead Email Sequences',
      description: 'Automatically send personalized follow-up emails when leads take specific actions in your CRM.',
      difficulty: 'Easy',
      estimated_savings: Math.round(12000 * sizeMultiplier),
      setup_time: '2-3 hours',
      software_involved: [hasHubSpot ? 'HubSpot' : 'Salesforce', 'Email'],
      workflow_steps: [
        'Lead fills out form or takes action',
        'CRM triggers automation',
        'Personalized email sequence begins',
        'Follow-up tasks created for sales team'
      ],
      category: 'Lead Management'
    });
  }

  // Communication Automation
  if (hasSlack && (hasHubSpot || hasSalesforce)) {
    opportunities.push({
      id: 'sales-notification-automation',
      title: 'Instant Sales Notifications',
      description: 'Get real-time Slack notifications when high-value leads take important actions.',
      difficulty: 'Easy',
      estimated_savings: Math.round(8000 * sizeMultiplier),
      setup_time: '1-2 hours',
      software_involved: ['Slack', hasHubSpot ? 'HubSpot' : 'Salesforce'],
      workflow_steps: [
        'Lead reaches target score or takes action',
        'CRM sends webhook',
        'Slack notification sent to sales channel',
        'Sales rep receives immediate alert'
      ],
      category: 'Communication'
    });
  }

  // Meeting Automation
  if (hasCalendly && (hasHubSpot || hasSalesforce)) {
    opportunities.push({
      id: 'meeting-crm-sync',
      title: 'Meeting-to-CRM Automation',
      description: 'Automatically create CRM contacts and deals when someone books a meeting.',
      difficulty: 'Medium',
      estimated_savings: Math.round(15000 * sizeMultiplier),
      setup_time: '3-4 hours',
      software_involved: ['Calendly', hasHubSpot ? 'HubSpot' : 'Salesforce'],
      workflow_steps: [
        'Prospect books meeting',
        'Contact created in CRM',
        'Deal pipeline updated',
        'Follow-up tasks scheduled'
      ],
      category: 'Lead Management'
    });
  }

  // Data Sync Automation
  if (hasSheets && (hasHubSpot || hasSalesforce)) {
    opportunities.push({
      id: 'data-sync-automation',
      title: 'Spreadsheet-CRM Data Sync',
      description: 'Keep your spreadsheets and CRM automatically synchronized without manual data entry.',
      difficulty: 'Medium',
      estimated_savings: Math.round(18000 * sizeMultiplier),
      setup_time: '4-5 hours',
      software_involved: ['Google Sheets/Excel', hasHubSpot ? 'HubSpot' : 'Salesforce'],
      workflow_steps: [
        'Data updated in spreadsheet',
        'Automation detects changes',
        'CRM records updated automatically',
        'Duplicate prevention applied'
      ],
      category: 'Data Sync'
    });
  }

  // Reporting Automation
  if (hasAirtable || hasSheets) {
    opportunities.push({
      id: 'automated-reporting',
      title: 'Automated Weekly Reports',
      description: 'Generate and distribute weekly performance reports automatically.',
      difficulty: 'Medium',
      estimated_savings: Math.round(10000 * sizeMultiplier),
      setup_time: '3-4 hours',
      software_involved: [hasAirtable ? 'Airtable' : 'Spreadsheets', 'Email'],
      workflow_steps: [
        'Data collected from multiple sources',
        'Report generated automatically',
        'Charts and insights added',
        'Report emailed to stakeholders'
      ],
      category: 'Reporting'
    });
  }

  // Universal opportunities if they have 3+ software tools
  if (selectedSoftware.length >= 3) {
    opportunities.push({
      id: 'universal-automation',
      title: 'Cross-Platform Workflow Automation',
      description: `With ${selectedSoftware.length} tools, you have significant automation potential. Connect your software to eliminate manual handoffs.`,
      difficulty: 'Advanced',
      estimated_savings: Math.round(25000 * sizeMultiplier),
      setup_time: '1-2 weeks',
      software_involved: selectedSoftware.slice(0, 4),
      workflow_steps: [
        'Map current manual processes',
        'Identify automation opportunities',
        'Build workflows connecting tools',
        'Test and optimize automations'
      ],
      category: 'Data Sync'
    });
  }

  return opportunities.sort((a, b) => b.estimated_savings - a.estimated_savings);
}

export function analyzeAutomationPotential(
  selectedSoftware: string[],
  companySize?: string,
  employeeCount?: number
): AutomationAnalysis {
  const platforms = detectAutomationPlatforms(selectedSoftware);
  const opportunities = generateAutomationOpportunities(selectedSoftware, companySize, employeeCount);
  
  const totalSavings = opportunities.reduce((sum, opp) => sum + opp.estimated_savings, 0);
  
  // Calculate automation maturity score
  let maturityScore = 0;
  maturityScore += platforms.detected.length * 20; // 20 points per automation platform
  maturityScore += Math.min(selectedSoftware.length * 5, 30); // Up to 30 points for software count
  maturityScore += opportunities.length * 3; // 3 points per opportunity
  
  return {
    has_automation_platform: platforms.detected.length > 0,
    detected_platforms: platforms.detected,
    missing_platforms: platforms.missing.slice(0, 3), // Show top 3 recommendations
    automation_opportunities: opportunities,
    potential_annual_savings: totalSavings,
    automation_maturity_score: Math.min(100, maturityScore)
  };
}