// src/app/api/ai-integration-analysis/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, selectedSoftware, companyData } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technology integration consultant specializing in business automation and API integrations. Always respond with valid JSON matching the requested format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    return NextResponse.json({ 
      analysis: data.choices[0].message.content,
      software_count: selectedSoftware.length,
      company: companyData.company
    });

  } catch (error) {
    console.error('AI Integration Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI integration analysis' }, 
      { status: 500 }
    );
  }
}