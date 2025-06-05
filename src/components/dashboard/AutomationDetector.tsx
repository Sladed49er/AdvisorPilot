// src/components/dashboard/AutomationDetector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Zap, Bot, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyzeAutomationPotential, AutomationAnalysis } from '@/lib/automationEngine';
import { LeadData } from '../LeadCaptureForm';
import Tooltip from '../ui/Tooltip';

interface AutomationDetectorProps {
  selectedSoftware: string[];
  leadData: LeadData | null;
}

export default function AutomationDetector({ selectedSoftware, leadData }: AutomationDetectorProps) {
  const [automationAnalysis, setAutomationAnalysis] = useState<AutomationAnalysis | null>(null);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (selectedSoftware.length > 0) {
      const analysis = analyzeAutomationPotential(
        selectedSoftware,
        leadData?.companySize,
        leadData?.employeeCount
      );
      setAutomationAnalysis(analysis);
    }
  }, [selectedSoftware, leadData]);

  if (!automationAnalysis || selectedSoftware.length === 0) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lead Management': return '🎯';
      case 'Communication': return '💬';
      case 'Data Sync': return '🔄';
      case 'Reporting': return '📊';
      case 'Document Management': return '📁';
      default: return '⚡';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <span>Automation Intelligence</span>
          <Tooltip content="AI-powered analysis of your automation potential based on your current software stack." />
        </h2>
        
        {/* Automation Maturity Score */}
        <div className="flex items-center space-x-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{automationAnalysis.automation_maturity_score}</div>
            <div className="text-xs text-gray-500">Automation Score</div>
          </div>
        </div>
      </div>

      {/* Platform Detection Status */}
      <div className="mb-6">
        {automationAnalysis.has_automation_platform ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Automation Platform Detected!</span>
            </div>
            <p className="text-green-700 text-sm mb-2">
              Found: {automationAnalysis.detected_platforms.join(', ')}
            </p>
            <p className="text-green-600 text-sm">
              Great! You're already using automation tools. Here are additional opportunities to maximize your ROI.
            </p>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Automation Opportunity Detected!</span>
            </div>
            <p className="text-orange-700 text-sm mb-2">
              No automation platform detected in your stack.
            </p>
            <p className="text-orange-600 text-sm">
              Adding automation could save ${automationAnalysis.potential_annual_savings.toLocaleString()}/year with your current software.
            </p>
          </div>
        )}
      </div>

      {/* Automation Opportunities */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <span>Automation Opportunities ({automationAnalysis.automation_opportunities.length})</span>
        </h3>

        {automationAnalysis.automation_opportunities.map((opportunity) => (
          <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{getCategoryIcon(opportunity.category)}</span>
                  <h4 className="font-semibold text-gray-900">{opportunity.title}</h4>
                </div>
                <p className="text-gray-600 text-sm mb-2">{opportunity.description}</p>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <span className={`text-xs px-2 py-1 rounded font-medium ${getDifficultyColor(opportunity.difficulty)}`}>
                  {opportunity.difficulty}
                </span>
                <span className="text-green-600 font-semibold text-sm">
                  ${opportunity.estimated_savings.toLocaleString()}/year
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{opportunity.setup_time}</span>
                </div>
                <div>
                  Software: {opportunity.software_involved.slice(0, 2).join(', ')}
                  {opportunity.software_involved.length > 2 && ` +${opportunity.software_involved.length - 2}`}
                </div>
              </div>
              
              <button
                onClick={() => setShowDetails(prev => ({
                  ...prev,
                  [opportunity.id]: !prev[opportunity.id]
                }))}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                {showDetails[opportunity.id] ? 'Hide Details' : 'Show Workflow'}
              </button>
            </div>

            {/* Workflow Steps */}
            {showDetails[opportunity.id] && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-2">Automation Workflow:</div>
                <div className="space-y-1">
                  {opportunity.workflow_steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Potential */}
      {automationAnalysis.potential_annual_savings > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Total Automation Potential</span>
              </h4>
              <p className="text-blue-600 text-sm">
                Implementing these automations could save your team significant time and money.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">
                ${automationAnalysis.potential_annual_savings.toLocaleString()}
              </div>
              <div className="text-blue-600 text-sm">per year</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}