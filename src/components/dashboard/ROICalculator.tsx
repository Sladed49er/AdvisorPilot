// src/components/dashboard/ROICalculator.tsx
'use client';

import { useState } from 'react';
import { BarChart3, Target, Shield, Calculator } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { LeadData } from '../LeadCaptureForm';

interface ROIData {
  manualHours: number;
  dataEntryHours: number;
  reportingHours: number;
  estimatedSavings: number;
}

interface ROICalculatorProps {
  leadData: LeadData | null;
  roiData: ROIData;
  setRoiData: React.Dispatch<React.SetStateAction<ROIData>>;
  techMaturityScore: number;
  onCalculateROI: () => void;
}

export default function ROICalculator({ 
  leadData, 
  roiData, 
  setRoiData, 
  techMaturityScore, 
  onCalculateROI 
}: ROICalculatorProps) {
  const [showCalculationBreakdown, setShowCalculationBreakdown] = useState(false);

  const getHourlyRate = () => {
    if (!leadData?.employeeCount) return 50;
    return leadData.employeeCount <= 50 ? 35 : 
           leadData.employeeCount <= 200 ? 50 : 75;
  };

  const getEfficiencyGain = () => {
    if (!leadData?.employeeCount) return 0.7;
    return leadData.employeeCount <= 50 ? 0.6 : 
           leadData.employeeCount <= 200 ? 0.7 : 0.8;
  };

  const getBenchmarkText = () => {
    if (techMaturityScore >= 80) return "You're ahead of 85% of companies in your industry! 🚀";
    if (techMaturityScore >= 60) return "You're on par with 60% of industry leaders 📈";
    return "Significant opportunity to improve vs industry standards 💡";
  };

  const totalWeeklyHours = roiData.manualHours + roiData.dataEntryHours + roiData.reportingHours;
  const annualHours = totalWeeklyHours * 52;
  const hourlyRate = getHourlyRate();
  const efficiencyGain = getEfficiencyGain();

  return (
    <div className="space-y-6">
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>ROI Quick Assessment</span>
          <Tooltip content="Our ROI calculator uses industry-standard hourly rates and proven efficiency gains from automation implementations across similar companies." />
        </h3>
        
        <div className="space-y-4">
          {/* Data Entry Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <span>Hours/week spent on manual data entry:</span>
              <Tooltip content={`Based on ${hourlyRate === 35 ? 'small business' : hourlyRate === 50 ? 'mid-market' : 'enterprise'} standards. We calculate potential time savings from automating repetitive data entry tasks.`} />
            </label>
            <input
              type="range"
              min="0"
              max="40"
              value={roiData.dataEntryHours}
              onChange={(e) => {
                const hours = parseInt(e.target.value);
                setRoiData(prev => ({ ...prev, dataEntryHours: hours }));
                onCalculateROI();
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(roiData.dataEntryHours / 40) * 100}%, #E5E7EB ${(roiData.dataEntryHours / 40) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 hrs</span>
              <span className="font-semibold text-gray-900">{roiData.dataEntryHours} hrs/week</span>
              <span>40 hrs</span>
            </div>
          </div>

          {/* Reporting Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <span>Hours/week spent on manual reporting:</span>
              <Tooltip content="Time spent creating reports, dashboards, and analytics manually. Automation can reduce this by 60-80% through automated data visualization and scheduled reports." />
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={roiData.reportingHours}
              onChange={(e) => {
                const hours = parseInt(e.target.value);
                setRoiData(prev => ({ ...prev, reportingHours: hours }));
                onCalculateROI();
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(roiData.reportingHours / 20) * 100}%, #E5E7EB ${(roiData.reportingHours / 20) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 hrs</span>
              <span className="font-semibold text-gray-900">{roiData.reportingHours} hrs/week</span>
              <span>20 hrs</span>
            </div>
          </div>

          {/* Other Manual Processes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <span>Hours/week on other manual processes:</span>
              <Tooltip content="Includes file transfers, manual approvals, copy-paste operations, and other repetitive tasks that could be automated through workflow tools and integrations." />
            </label>
            <input
              type="range"
              min="0"
              max="30"
              value={roiData.manualHours}
              onChange={(e) => {
                const hours = parseInt(e.target.value);
                setRoiData(prev => ({ ...prev, manualHours: hours }));
                onCalculateROI();
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(roiData.manualHours / 30) * 100}%, #E5E7EB ${(roiData.manualHours / 30) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 hrs</span>
              <span className="font-semibold text-gray-900">{roiData.manualHours} hrs/week</span>
              <span>30 hrs</span>
            </div>
          </div>
        </div>

        {/* ROI Display */}
        {roiData.estimatedSavings > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-800 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Automation Opportunity</span>
              </h4>
              <button
                onClick={() => setShowCalculationBreakdown(!showCalculationBreakdown)}
                className="text-green-600 text-xs underline hover:text-green-700 flex items-center space-x-1"
              >
                <Calculator className="w-3 h-3" />
                <span>{showCalculationBreakdown ? 'Hide' : 'Show'} Calculation</span>
              </button>
            </div>
            
            <p className="text-3xl font-bold text-green-700 mb-1">
              ${Math.round(roiData.estimatedSavings).toLocaleString()}/year
            </p>
            <p className="text-green-600 text-sm">Potential savings through automation</p>
            
            {showCalculationBreakdown && (
              <div className="mt-4 p-3 bg-green-100 rounded text-xs text-green-800">
                <div className="font-medium mb-2">Calculation Breakdown:</div>
                <div className="space-y-1">
                  <div>• Weekly hours: {totalWeeklyHours} hrs/week</div>
                  <div>• Annual hours: {annualHours} hrs/year</div>
                  <div>• Hourly rate: ${hourlyRate}/hr (based on {leadData?.employeeCount || 'Unknown'} employees)</div>
                  <div>• Efficiency gain: {Math.round(efficiencyGain * 100)}% (industry standard)</div>
                  <div className="border-t border-green-300 pt-1 mt-2">
                    <strong>Formula: {annualHours} hrs × ${hourlyRate}/hr × {Math.round(efficiencyGain * 100)}% = ${Math.round(roiData.estimatedSavings).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-2 text-xs text-green-600">
              {annualHours} hours/year → {Math.round(annualHours * (1 - efficiencyGain))} hours/year (saved: {Math.round(annualHours * efficiencyGain)} hours)
            </div>
          </div>
        )}

        {/* Tech Maturity Score */}
        {techMaturityScore > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Tech Maturity Score</span>
              <Tooltip content="Calculated based on your current software stack, integration count, automation level, and company size. Higher scores indicate more sophisticated technology infrastructure." />
            </h4>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-blue-700">{techMaturityScore}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      techMaturityScore >= 80 ? 'bg-green-500' :
                      techMaturityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${techMaturityScore}%` }}
                  ></div>
                </div>
                <p className="text-blue-600 text-xs mt-2">
                  {getBenchmarkText()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}