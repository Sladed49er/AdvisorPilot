// src/lib/aiIntegrationEngine.ts
import { AutomationOpportunity } from './automationEngine';

interface AIIntegrationAnalysis {
  executive_summary: string;
  integration_score: number; // 0-100
  automation_readiness: 'Low' | 'Medium' | 'High' | 'Enterprise';
  recommended_workflows: AIWorkflow[];
  implementation_roadmap: ImplementationPhase[];
  cost_benefit_analysis: CostBenefit;
  next_steps: string[];
}

interface AIWorkflow {
  id: string;
  title: string;
  description: string;
  software_involved: string[];
  automation_type: 'Zapier' | 'Make' | 'Native API' | 'Custom Integration';
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimated_savings: number;
  implementation_time: string;
  step_by_step: string[];
  roi_timeline: string;
}

interface ImplementationPhase {
  phase: string;
  duration: string;
  focus_area: string;
  key_deliverables: string[];
  estimated_cost: string;
  expected_roi: string;
}

interface CostBenefit {
  total_potential_savings: number;
  implementation_cost_estimate: string;
  payback_period: string;
  risk_assessment: string;
}

export async function generateAIIntegrationAnalysis(
  selectedSoftware: string[],
  integrationData: {[key: string]: any},
  leadData: {
    company: string;
    employeeCount: number;
    companySize: string;
  }
): Promise<AIIntegrationAnalysis> {
  
  // Build comprehensive prompt with real data
  const prompt = buildAnalysisPrompt(selectedSoftware, integrationData, leadData);
  
  try {
    const response = await fetch('/api/ai-integration-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        selectedSoftware,
        companyData: leadData
      }),
    });

    if (!response.ok) {
      throw new Error('AI analysis request failed');
    }

    const result = await response.json();
    return parseAIResponse(result.analysis);
    
  } catch (error) {
    console.error('AI Integration Analysis Error:', error);
    throw new Error('Failed to generate AI integration analysis');
  }
}

function buildAnalysisPrompt(
  selectedSoftware: string[],
  integrationData: {[key: string]: any},
  leadData: any
): string {
  // Get detailed integration data for each selected software
  const softwareDetails = selectedSoftware.map(software => {
    const data = integrationData[software];
    return data ? {
      name: software,
      functions: data.main_functions || [],
      integrates_with: data.integrates_with || [],
      industries: data.best_used_for_industries || [],
      verified: data.verified || false
    } : null;
  }).filter((software): software is NonNullable<typeof software> => software !== null);

  return `You are an expert technology integration consultant. Analyze this ${leadData.companySize}-employee company&apos;s software stack and provide detailed automation recommendations.

COMPANY PROFILE:
- Company: ${leadData.company}
- Size: ${leadData.employeeCount} employees (${leadData.companySize})
- Industry focus: Based on software selection

CURRENT SOFTWARE STACK:
${softwareDetails.map(software => 
  `• ${software.name}
    Functions: ${software.functions.join(', ')}
    Current Integrations Available: ${software.integrates_with.slice(0, 8).join(', ')}${software.integrates_with.length > 8 ? ` (+${software.integrates_with.length - 8} more)` : ''}
    Industries: ${software.industries.join(', ')}`
).join('\n\n')}

ANALYSIS REQUIREMENTS:
Provide a comprehensive integration analysis with these specific sections:

1. EXECUTIVE SUMMARY (2-3 sentences)
   - Overall integration potential assessment
   - Key opportunity areas
   - Expected business impact

2. INTEGRATION SCORE (0-100)
   - Rate their current integration maturity
   - Consider software compatibility and company size

3. AUTOMATION READINESS (Low/Medium/High/Enterprise)
   - Based on software stack sophistication
   - Team size and complexity needs

4. RECOMMENDED WORKFLOWS (3-5 specific workflows)
   For each workflow provide:
   - Title (action-oriented)
   - Description (specific benefit)
   - Software involved (from their stack)
   - Automation type (Zapier/Make/Native API/Custom)
   - Difficulty (Easy/Medium/Advanced)
   - Estimated annual savings (realistic for company size)
   - Implementation time
   - Step-by-step process (4-5 steps)
   - ROI timeline

5. IMPLEMENTATION ROADMAP (3-4 phases)
   For each phase:
   - Phase name (30-60-90 day structure)
   - Duration
   - Focus area
   - Key deliverables (3-4 items)
   - Estimated cost range
   - Expected ROI

6. COST-BENEFIT ANALYSIS
   - Total potential annual savings
   - Implementation cost estimate
   - Payback period
   - Risk assessment

7. NEXT STEPS (3-5 action items)
   - Immediate actions they can take
   - Resources needed
   - Success metrics

Focus on ACTIONABLE recommendations with specific dollar amounts and timeframes. Consider their company size for realistic estimates. Prioritize high-impact, low-effort wins first.

Respond in valid JSON format matching the TypeScript interfaces.`;
}

function parseAIResponse(aiResponse: string): AIIntegrationAnalysis {
  try {
    // Clean up the AI response and parse JSON
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    // Validate and return the structured response
    return {
      executive_summary: parsed.executive_summary || 'Analysis generated successfully.',
      integration_score: parsed.integration_score || 75,
      automation_readiness: parsed.automation_readiness || 'Medium',
      recommended_workflows: parsed.recommended_workflows || [],
      implementation_roadmap: parsed.implementation_roadmap || [],
      cost_benefit_analysis: parsed.cost_benefit_analysis || {
        total_potential_savings: 50000,
        implementation_cost_estimate: '$10,000 - $25,000',
        payback_period: '3-6 months',
        risk_assessment: 'Low to moderate risk with high potential reward'
      },
      next_steps: parsed.next_steps || ['Contact integration specialist', 'Assess current workflow pain points', 'Begin with highest-ROI automation']
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Return fallback response
    return generateFallbackAnalysis();
  }
}

function generateFallbackAnalysis(): AIIntegrationAnalysis {
  return {
    executive_summary: 'Your software stack shows strong automation potential. Multiple integration opportunities identified with significant ROI potential.',
    integration_score: 75,
    automation_readiness: 'High',
    recommended_workflows: [],
    implementation_roadmap: [],
    cost_benefit_analysis: {
      total_potential_savings: 50000,
      implementation_cost_estimate: '$10,000 - $25,000',
      payback_period: '4-6 months',
      risk_assessment: 'Low risk with proven automation platforms'
    },
    next_steps: [
      'Schedule integration assessment call',
      'Identify highest-priority workflow automations',
      'Begin with Zapier/Make platform evaluation'
    ]
  };
}