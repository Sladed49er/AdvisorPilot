import { NextResponse } from 'next/server';
import { getSoftwareByIndustry, getFrictionsByIndustry } from '@/lib/dataEngine';

export async function POST(req: Request) {
  try {
    const { industry, painPoints } = await req.json();

    // Get industry-specific data from your JSON files
    const software = getSoftwareByIndustry(industry);
    const frictions = getFrictionsByIndustry(industry);
    
    // Build comprehensive prompt
    const prompt = `
You are an expert technology advisor specializing in ${industry}. Analyze this company's situation:

CURRENT SOFTWARE STACK:
${software.map(s => `- ${s.name}: Functions: ${s.main_functions.join(', ')} | Integrates with: ${s.integrates_with.join(', ')}`).join('\n')}

INDUSTRY PAIN POINTS:
${frictions.map(f => `- ${f}`).join('\n')}

ADDITIONAL CLIENT PAIN POINTS:
${(painPoints || []).map((p: string) => `- ${p}`).join('\n')}

Please provide a strategic analysis with:

1. **INTEGRATION OPPORTUNITIES** (3-4 specific recommendations)
   - Which software should integrate but doesn't
   - Estimated time savings and ROI
   - Implementation complexity

2. **AUTOMATION POTENTIAL** 
   - Specific workflows that can be automated
   - AI/API opportunities using Zapier or Make.com
   - Expected efficiency gains

3. **RISK ASSESSMENT**
   - Security vulnerabilities in current stack
   - Compliance gaps for ${industry}
   - Business continuity risks

4. **STRATEGIC RECOMMENDATIONS**
   - Priority 1 (next 60 days): Most critical improvements
   - Priority 2 (60-120 days): Strategic enhancements  
   - Priority 3 (120+ days): Advanced optimization

5. **VOIP/UCAAS/CCAAS ANALYSIS**
   - Current communication stack assessment
   - Integration opportunities with business tools
   - Scalability and feature recommendations

Focus on specific, actionable insights with dollar impact estimates.
`;

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    return NextResponse.json({ 
      insights: data.choices[0].message.content,
      software_count: software.length,
      integration_opportunities: software.length * 2 // Estimate
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' }, 
      { status: 500 }
    );
  }
}