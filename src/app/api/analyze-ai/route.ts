// src/app/api/analyze-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeStackWithAI, generateContextualRecommendations, analyzeCustomSoftware } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      selectedSoftware = [], 
      customSoftware = [], 
      industry, 
      painPoints = [],
      companySize 
    } = body;

    // Validate required fields
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' }, 
        { status: 400 }
      );
    }

    console.log('AI Analysis Request:', { 
      selectedSoftware, 
      customSoftware, 
      industry, 
      painPoints,
      companySize 
    });

    // Step 1: Main AI analysis
    const analysis = await analyzeStackWithAI(
      selectedSoftware,
      customSoftware,
      industry,
      painPoints
    );

    // Step 2: Analyze any custom software individually
    const customSoftwareAnalyses = await Promise.all(
      customSoftware.map((software: string) => 
        analyzeCustomSoftware(software, industry, selectedSoftware)
      )
    );

    // Step 3: Generate contextual recommendations
    const contextualRecommendations = await generateContextualRecommendations(
      analysis,
      industry,
      companySize
    );

    // Step 4: Combine results
    const enhancedAnalysis = {
      ...analysis,
      customSoftwareInsights: [
        ...analysis.customSoftwareInsights,
        ...customSoftwareAnalyses
      ],
      contextualRecommendations: [
        ...analysis.contextualRecommendations,
        ...contextualRecommendations
      ]
    };

    console.log('AI Analysis Complete:', enhancedAnalysis);

    return NextResponse.json({
      success: true,
      data: enhancedAnalysis
    });

  } catch (error) {
    console.error('AI Analysis API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'AI analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}