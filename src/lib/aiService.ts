// src/lib/aiService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for AI analysis
export interface AIIntegrationAnalysis {
  hasVoIP: boolean;
  voipProvider?: string;
  missingIntegrations: string[];
  customSoftwareInsights: CustomSoftwareInsight[];
  contextualRecommendations: string[];
}

export interface CustomSoftwareInsight {
  softwareName: string;
  category: string;
  suggestedIntegrations: string[];
  industryRelevance: string;
}

export interface ZapierIntegration {
  app1: string;
  app2: string;
  description: string;
  popularity: number;
}

// Main AI analysis function
export async function analyzeStackWithAI(
  selectedSoftware: string[],
  customSoftware: string[],
  industry: string,
  painPoints: string[]
): Promise<AIIntegrationAnalysis> {
  
  const prompt = `
You are an enterprise software integration expert. Analyze this business software stack:

**Selected Software:** ${selectedSoftware.join(', ')}
**Custom Software:** ${customSoftware.join(', ')}
**Industry:** ${industry}
**Pain Points:** ${painPoints.join(', ')}

Please analyze and respond with a JSON object containing:

1. **hasVoIP**: boolean - Do they already have a VoIP/cloud phone system?
2. **voipProvider**: string - If they have VoIP, which provider?
3. **missingIntegrations**: array - What integration opportunities exist between their current software?
4. **customSoftwareInsights**: array - For any custom/unknown software, categorize it and suggest integrations
5. **contextualRecommendations**: array - Smart recommendations that consider what they ALREADY have

Format each customSoftwareInsight as:
{
  "softwareName": "Custom CRM",
  "category": "Customer Relationship Management", 
  "suggestedIntegrations": ["Email marketing tools", "Accounting software"],
  "industryRelevance": "High - CRMs are essential for insurance agencies"
}

Be specific about integration opportunities and avoid recommending what they already have.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert software integration consultant. Always respond with valid JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const analysis: AIIntegrationAnalysis = JSON.parse(responseText);
    return analysis;

  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    // Fallback to basic analysis if AI fails
    return {
      hasVoIP: selectedSoftware.some(software => 
        ['RingCentral', 'Zoom Phone', '8x8', 'Vonage', 'Dialpad'].includes(software)
      ),
      voipProvider: selectedSoftware.find(software => 
        ['RingCentral', 'Zoom Phone', '8x8', 'Vonage', 'Dialpad'].includes(software)
      ),
      missingIntegrations: [],
      customSoftwareInsights: customSoftware.map(software => ({
        softwareName: software,
        category: 'Unknown',
        suggestedIntegrations: ['CRM', 'Email', 'Calendar'],
        industryRelevance: 'Requires analysis'
      })),
      contextualRecommendations: ['Enable AI analysis with OpenAI API key']
    };
  }
}

// Query live Zapier integrations
export async function queryZapierIntegrations(software1: string, software2: string): Promise<ZapierIntegration[]> {
  // This would be a real Zapier API call in production
  // For now, we'll use AI to simulate this
  
  const prompt = `
Check if ${software1} and ${software2} can integrate via Zapier or similar automation platforms.

Respond with JSON array of possible integrations:
[
  {
    "app1": "${software1}",
    "app2": "${software2}", 
    "description": "Sync contacts from ${software1} to ${software2}",
    "popularity": 85
  }
]

If no direct integration exists, suggest creative workflows using common middle-ground apps like Google Sheets, Webhooks, or Email.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a Zapier integration expert. Always respond with valid JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) return [];

    return JSON.parse(responseText);

  } catch (error) {
    console.error('Zapier Integration Query Error:', error);
    return [];
  }
}

// Generate contextual recommendations
export async function generateContextualRecommendations(
  analysis: AIIntegrationAnalysis,
  industry: string,
  companySize: string
): Promise<string[]> {

  const prompt = `
Based on this software analysis, generate 3-5 specific, actionable recommendations:

**Industry:** ${industry}
**Company Size:** ${companySize}
**Has VoIP:** ${analysis.hasVoIP} ${analysis.voipProvider ? `(${analysis.voipProvider})` : ''}
**Custom Software:** ${analysis.customSoftwareInsights.map(s => s.softwareName).join(', ')}

Guidelines:
- If they have VoIP, focus on integrations, not VoIP upgrades
- Be specific about their actual software stack
- Prioritize high-impact, low-effort wins
- Consider their industry needs
- Avoid generic advice

Respond with JSON array of recommendation strings:
["Specific recommendation 1", "Specific recommendation 2", ...]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a business technology consultant. Always respond with valid JSON array of strings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1500
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) return [];

    return JSON.parse(responseText);

  } catch (error) {
    console.error('Contextual Recommendations Error:', error);
    return ['Enable AI analysis for personalized recommendations'];
  }
}

// Analyze custom software that's not in your database
export async function analyzeCustomSoftware(
  softwareName: string,
  industry: string,
  existingStack: string[]
): Promise<CustomSoftwareInsight> {

  const prompt = `
Analyze this custom/unknown software: "${softwareName}"

**Industry Context:** ${industry}
**Existing Software Stack:** ${existingStack.join(', ')}

Determine:
1. What category/type of software this likely is
2. What it probably integrates with
3. How relevant it is to the ${industry} industry
4. Specific integration opportunities with their existing stack

Respond with JSON:
{
  "softwareName": "${softwareName}",
  "category": "Best guess category",
  "suggestedIntegrations": ["Specific software from their stack or common tools"],
  "industryRelevance": "Explanation of relevance to ${industry}"
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a software categorization expert. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(responseText);

  } catch (error) {
    console.error('Custom Software Analysis Error:', error);
    
    // Fallback analysis
    return {
      softwareName,
      category: 'Business Software',
      suggestedIntegrations: existingStack.slice(0, 3),
      industryRelevance: `Requires manual analysis for ${industry} industry`
    };
  }
}