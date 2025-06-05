// src/lib/automationEngine.ts
import integrationData from '@/data/integration-data.json';

// Cast your integration data properly
const typedIntegrationData = integrationData as {[softwareName: string]: {
  integrates_with: string[];
  main_functions: string[];
  best_used_for_industries: string[];
  verified: boolean;
}};

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
  integration_exists: boolean;
}

export interface AutomationAnalysis {
  has_automation_platform: boolean;
  detected_platforms: string[];
  missing_platforms: string[];
  automation_opportunities: AutomationOpportunity[];
  potential_annual_savings: number;
  automation_maturity_score: number;
}

// Detect automation platforms from your actual JSON data
export function detectAutomationPlatforms(selectedSoftware: string[]): {
  detected: string[];
  missing: string[];
} {
  const automationKeywords = ['zapier', 'automation', 'workflow', 'integration', 'api'];
  
  // Check selected software for automation capabilities
  const detected = selectedSoftware.filter(software => {
    const softwareData = typedIntegrationData[software];
    if (!softwareData) return false;
    
    // Check if software name contains automation keywords
    const nameCheck = automationKeywords.some(keyword => 
      software.toLowerCase().includes(keyword)
    );
    
    // Check if main functions indicate automation capabilities
    const functionCheck = softwareData.main_functions.some(func =>
      automationKeywords.some(keyword => func.toLowerCase().includes(keyword))
    );
    
    // Check if it integrates with known automation platforms
    const integrationCheck = softwareData.integrates_with.some(integration =>
      automationKeywords.some(keyword => integration.toLowerCase().includes(keyword)) ||
      integration.toLowerCase().includes('zapier')
    );
    
    return nameCheck || functionCheck || integrationCheck;
  });

  // Find potential automation platforms from your JSON that aren't selected
  const allAutomationPlatforms = Object.keys(typedIntegrationData).filter(software => {
    const softwareData = typedIntegrationData[software];
    return automationKeywords.some(keyword => 
      software.toLowerCase().includes(keyword) ||
      softwareData.main_functions.some(func => func.toLowerCase().includes(keyword))
    );
  });

  const missing = allAutomationPlatforms.filter(platform =>
    !selectedSoftware.includes(platform)
  ).slice(0, 3);

  return { detected, missing };
}

export function generateAutomationOpportunities(
  selectedSoftware: string[],
  companySize?: string,
  employeeCount?: number
): AutomationOpportunity[] {
  const opportunities: AutomationOpportunity[] = [];
  const sizeMultiplier = employeeCount ? Math.max(1, employeeCount / 50) : 1;

  // Generate opportunities based on ACTUAL integration data from your JSON
  selectedSoftware.forEach((software1, index) => {
    const software1Data = typedIntegrationData[software1];
    if (!software1Data) return;

    selectedSoftware.slice(index + 1).forEach(software2 => {
      const software2Data = typedIntegrationData[software2];
      if (!software2Data) return;

      // Check if these two software CAN integrate (from your JSON)
      const canIntegrate = software1Data.integrates_with.includes(software2) ||
                          software2Data.integrates_with.includes(software1);

      if (canIntegrate) {
        // Create automation opportunity based on software types
        const category = determineAutomationCategory(software1Data.main_functions, software2Data.main_functions);
        
        opportunities.push({
          id: `${software1}-${software2}-automation`,
          title: `${software1} ↔ ${software2} Integration`,
          description: generateAutomationDescription(software1, software2, software1Data.main_functions, software2Data.main_functions),
          difficulty: 'Medium',
          estimated_savings: Math.round((8000 + Math.random() * 12000) * sizeMultiplier),
          setup_time: '2-4 hours',
          software_involved: [software1, software2],
          workflow_steps: generateWorkflowSteps(software1, software2, category),
          category,
          integration_exists: true
        });
      }
    });
  });

  // Add opportunities for missing integrations (potential with automation platforms)
  const automationPlatforms = detectAutomationPlatforms(selectedSoftware);
  
  // If they don't have automation platforms, suggest adding them
  if (automationPlatforms.detected.length === 0 && selectedSoftware.length >= 2) {
    opportunities.push({
      id: 'add-automation-platform',
      title: 'Add Automation Platform (Zapier/Make)',
      description: `Connect your ${selectedSoftware.length} tools with an automation platform to eliminate manual data transfer and create powerful workflows.`,
      difficulty: 'Easy',
      estimated_savings: Math.round(15000 * sizeMultiplier),
      setup_time: '1-2 days',
      software_involved: ['Zapier', ...selectedSoftware.slice(0, 3)],
      workflow_steps: [
        'Sign up for automation platform',
        'Connect your existing software',
        'Create automated workflows',
        'Monitor and optimize processes'
      ],
      category: 'Data Sync',
      integration_exists: false
    });
  }

  // Find specific high-value integrations from your JSON
  if (selectedSoftware.includes('Salesforce') || selectedSoftware.includes('HubSpot')) {
    const crmName = selectedSoftware.includes('Salesforce') ? 'Salesforce' : 'HubSpot';
    const emailTools = selectedSoftware.filter(s => 
      s.toLowerCase().includes('gmail') || 
      s.toLowerCase().includes('outlook') || 
      s.toLowerCase().includes('mail')
    );
    
    if (emailTools.length > 0) {
      opportunities.push({
        id: 'crm-email-automation',
        title: `${crmName} Email Automation`,
        description: 'Automatically trigger personalized email sequences based on CRM actions and lead behavior.',
        difficulty: 'Easy',
        estimated_savings: Math.round(12000 * sizeMultiplier),
        setup_time: '3-4 hours',
        software_involved: [crmName, emailTools[0]],
        workflow_steps: [
          'Set up email templates in CRM',
          'Configure trigger conditions',
          'Map data fields between systems',
          'Test automation workflows'
        ],
        category: 'Lead Management',
        integration_exists: true
      });
    }
  }

  return opportunities.sort((a, b) => b.estimated_savings - a.estimated_savings);
}

function determineAutomationCategory(functions1: string[], functions2: string[]): AutomationOpportunity['category'] {
  const allFunctions = [...functions1, ...functions2].map(f => f.toLowerCase());
  
  if (allFunctions.some(f => f.includes('crm') || f.includes('lead') || f.includes('sales'))) {
    return 'Lead Management';
  }
  if (allFunctions.some(f => f.includes('communication') || f.includes('email') || f.includes('message'))) {
    return 'Communication';
  }
  if (allFunctions.some(f => f.includes('report') || f.includes('analytic') || f.includes('dashboard'))) {
    return 'Reporting';
  }
  if (allFunctions.some(f => f.includes('document') || f.includes('file') || f.includes('content'))) {
    return 'Document Management';
  }
  return 'Data Sync';
}

function generateAutomationDescription(software1: string, software2: string, functions1: string[], functions2: string[]): string {
  const category = determineAutomationCategory(functions1, functions2);
  
  switch (category) {
    case 'Lead Management':
      return `Sync leads and contacts between ${software1} and ${software2}. Automatically update records, assign tasks, and trigger follow-up actions.`;
    case 'Communication':
      return `Streamline communication workflows between ${software1} and ${software2}. Auto-send notifications, sync messages, and coordinate responses.`;
    case 'Reporting':
      return `Combine data from ${software1} and ${software2} for unified reporting. Generate automatic insights and dashboard updates.`;
    case 'Document Management':
      return `Sync documents and files between ${software1} and ${software2}. Automate approvals, version control, and access management.`;
    default:
      return `Automatically sync data between ${software1} and ${software2}. Eliminate manual data entry and ensure information consistency.`;
  }
}

function generateWorkflowSteps(software1: string, software2: string, category: string): string[] {
  const baseSteps = [
    `Connect ${software1} and ${software2}`,
    'Map data fields between systems',
    'Configure sync settings',
    'Test automation workflow'
  ];
  
  switch (category) {
    case 'Lead Management':
      return [
        `New lead enters ${software1}`,
        `Automatically create contact in ${software2}`,
        'Sync lead scoring and status updates',
        'Trigger follow-up tasks and reminders'
      ];
    case 'Communication':
      return [
        `Message received in ${software1}`,
        `Notification sent via ${software2}`,
        'Route to appropriate team member',
        'Track response and follow-up'
      ];
    default:
      return baseSteps;
  }
}

export function analyzeAutomationPotential(
  selectedSoftware: string[],
  companySize?: string,
  employeeCount?: number
): AutomationAnalysis {
  const platforms = detectAutomationPlatforms(selectedSoftware);
  const opportunities = generateAutomationOpportunities(selectedSoftware, companySize, employeeCount);
  
  const totalSavings = opportunities.reduce((sum, opp) => sum + opp.estimated_savings, 0);
  
  // Calculate automation maturity score based on actual integrations
  let maturityScore = 0;
  maturityScore += platforms.detected.length * 25; // 25 points per automation platform
  maturityScore += Math.min(selectedSoftware.length * 3, 30); // Up to 30 points for software count
  
  // Bonus points for software that actually integrate with each other
  let integrationCount = 0;
  selectedSoftware.forEach(software1 => {
    const software1Data = typedIntegrationData[software1];
    if (software1Data) {
      integrationCount += selectedSoftware.filter(software2 => 
        software1 !== software2 && software1Data.integrates_with.includes(software2)
      ).length;
    }
  });
  maturityScore += Math.min(integrationCount * 5, 30); // Up to 30 points for actual integrations
  
  return {
    has_automation_platform: platforms.detected.length > 0,
    detected_platforms: platforms.detected,
    missing_platforms: platforms.missing,
    automation_opportunities: opportunities,
    potential_annual_savings: totalSavings,
    automation_maturity_score: Math.min(100, maturityScore)
  };
}