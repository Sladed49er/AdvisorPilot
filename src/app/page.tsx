'use client';

import { useState } from 'react';
import { 
  getIndustries, 
  analyzeIndustryWithAI, 
  getFrictionsByIndustry 
} from '@/lib/dataEngine';
import { AnalysisResult } from '@/types';
import LeadCaptureForm, { LeadData } from '@/components/LeadCaptureForm';
import SoftwareSelector from '@/components/dashboard/SoftwareSelector';
import AutomationDetector from '@/components/dashboard/AutomationDetector';
import { IntegrationStatus } from '@/types';
import { 
  Download, 
  FileText, 
  Mail, 
  Calendar,
  Users,
  Shield,
  Target,
  BarChart3,
} from 'lucide-react';

export default function AdvisorPilotDashboard() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [roiData, setRoiData] = useState({
    manualHours: 0,
    dataEntryHours: 0,
    reportingHours: 0,
    estimatedSavings: 0
  });
  const [techMaturityScore, setTechMaturityScore] = useState(0);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, IntegrationStatus>>({});
  const industries = getIndustries();
  const handleLeadSubmit = (data: LeadData) => {
    setLeadData(data);
    setShowDashboard(true);
    console.log('New lead captured:', data);
  };

  const calculateROI = () => {
    // Use exact employee count for more precise calculations
    const employeeCount = leadData?.employeeCount || 50;
    const hourlyRate = employeeCount <= 50 ? 35 : 
                       employeeCount <= 200 ? 50 : 75;
    
    const weeklyHours = roiData.manualHours + roiData.dataEntryHours + roiData.reportingHours;
    const annualHours = weeklyHours * 52;
    
    const efficiencyGain = employeeCount <= 50 ? 0.6 : 
                          employeeCount <= 200 ? 0.7 : 0.8;
    
    const potentialSavings = annualHours * hourlyRate * efficiencyGain;
    
    setRoiData(prev => ({ ...prev, estimatedSavings: potentialSavings }));
    
    const integrationCount = selectedSoftware.length;
    const automationScore = weeklyHours > 20 ? 20 : 40;
    const stackScore = integrationCount * 5;
    
    // Employee count bonus for tech maturity
    const sizeBonus = employeeCount <= 50 ? 0 : 
                     employeeCount <= 200 ? 10 : 20;
    
    const maturityScore = Math.min(100, automationScore + stackScore + sizeBonus + 10);
    
    setTechMaturityScore(maturityScore);
  };

  const handleAnalyze = async () => {
    if (!selectedIndustry) return;
    
    setIsAnalyzing(true);
    
    try {
      // Enhanced analysis with selected software and integration data
     const result = await analyzeIndustryWithAI(
  selectedIndustry,
  leadData?.companySize,
  selectedSoftware,
  integrationStatuses,
  [], // customSoftware - will add this later
  selectedPainPoints
);
      setAnalysis(result);
      
      // Simulate AI analysis time for better UX
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 3000);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
    }
  };

  const getBenchmarkText = () => {
    if (techMaturityScore >= 80) return "You're ahead of 85% of companies in your industry! 🚀";
    if (techMaturityScore >= 60) return "You're on par with 60% of industry leaders 📈";
    return "Significant opportunity to improve vs industry standards 💡";
  };

  // Show lead capture form first
  if (!showDashboard) {
    return <LeadCaptureForm onSubmit={handleLeadSubmit} />;
  }
  // Show main dashboard after lead capture
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo SVG */}
              <div className="flex items-center space-x-3">
                <svg width="40" height="40" viewBox="0 0 100 100" className="text-blue-600">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"/>
                  <polygon points="50,20 65,45 50,35 35,45" fill="currentColor"/>
                  <polygon points="50,80 35,55 50,65 65,55" fill="currentColor"/>
                  <polygon points="20,50 45,35 35,50 45,65" fill="currentColor"/>
                  <polygon points="80,50 55,65 65,50 55,35" fill="currentColor"/>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AdvisorPilot</h1>
                  <p className="text-sm text-gray-600">Turn Complexity Into Confidence</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Show lead info */}
              {leadData && (
                <div className="text-right">
                  <p className="text-gray-900 text-sm font-medium">{leadData.name}</p>
                  <p className="text-gray-500 text-xs">{leadData.company} • {leadData.employeeCount} employees</p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 text-sm font-medium">AI Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {leadData?.name}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            Let&apos;s analyze {leadData?.company}&apos;s technology stack and find optimization opportunities.
          </p>
        </div>

        {/* Progressive Layout Grid */}
        <div className={`transition-all duration-700 ease-in-out ${
          !analysis 
             ? 'max-w-2xl mx-auto' // Single centered column until analysis
             : 'max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8' // Clean 2-column results
            }`}>
          {/* Left Panel - Only show BEFORE analysis */}
              {!analysis && (
            <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Smart Discovery</h2>
              
              <div className="space-y-6">
                {/* Industry Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry Vertical
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white text-gray-900"
                  >
                    <option value="">Select Industry...</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ROI Calculator Section */}
                {selectedIndustry && (
                  <div className="space-y-6">
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <span>ROI Quick Assessment</span>
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hours/week spent on manual data entry:
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="40"
                            value={roiData.dataEntryHours}
                            onChange={(e) => {
                              const hours = parseInt(e.target.value);
                              setRoiData(prev => ({ ...prev, dataEntryHours: hours }));
                              calculateROI();
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hours/week spent on manual reporting:
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={roiData.reportingHours}
                            onChange={(e) => {
                              const hours = parseInt(e.target.value);
                              setRoiData(prev => ({ ...prev, reportingHours: hours }));
                              calculateROI();
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hours/week on other manual processes:
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={roiData.manualHours}
                            onChange={(e) => {
                              const hours = parseInt(e.target.value);
                              setRoiData(prev => ({ ...prev, manualHours: hours }));
                              calculateROI();
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
                          <h4 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Automation Opportunity</span>
                          </h4>
                          <p className="text-3xl font-bold text-green-700 mb-1">
                            ${Math.round(roiData.estimatedSavings).toLocaleString()}/year
                          </p>
                          <p className="text-green-600 text-sm">Potential savings through automation</p>
                          <div className="mt-2 text-xs text-green-600">
                            {Math.round((roiData.manualHours + roiData.dataEntryHours + roiData.reportingHours) * 52)} hours/year → 
                            {Math.round((roiData.manualHours + roiData.dataEntryHours + roiData.reportingHours) * 52 * 0.3)} hours/year
                          </div>
                        </div>
                      )}

                      {/* Tech Maturity Score */}
                      {techMaturityScore > 0 && (
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>Tech Maturity Score</span>
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
                )}
                {/* Software Selector */}
                {selectedIndustry && (
                  <SoftwareSelector
                    selectedIndustry={selectedIndustry}
                    selectedSoftware={selectedSoftware}
                    setSelectedSoftware={setSelectedSoftware}
                    onCalculateROI={calculateROI}
                    onIntegrationStatusChange={setIntegrationStatuses}
                  />
                )}

                {/* Pain Points */}
                {selectedIndustry && (
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Industry Pain Points (select relevant ones)
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-200">
                      {getFrictionsByIndustry(selectedIndustry).slice(0, 10).map((friction) => (
                        <label key={friction} className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-white p-1 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPainPoints.includes(friction)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPainPoints([...selectedPainPoints, friction]);
                              } else {
                                setSelectedPainPoints(selectedPainPoints.filter(p => p !== friction));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{friction}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedIndustry || isAnalyzing}
                  className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-lg disabled:hover:scale-100"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Intelligence Report...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Generate Complete Analysis</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
              )}
          {/* Center Panel - Only show AFTER analysis */}
          {analysis && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Analysis Results</h2>
                
                <div className="space-y-6">
                  {/* Total Savings */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Total Opportunity Identified</span>
                    </h4>
                    <p className="text-4xl font-bold text-green-700 mb-2">
                      ${(analysis.total_savings + roiData.estimatedSavings).toLocaleString()}
                    </p>
                    <p className="text-green-600">Annual savings potential</p>
                    <div className="mt-3 text-sm text-green-600 flex items-center space-x-4">
                      <span>${analysis.total_savings.toLocaleString()} optimization</span>
                      <span>+</span>
                      <span>${Math.round(roiData.estimatedSavings).toLocaleString()} automation</span>
                    </div>
                  </div>

                  {/* Current Stack */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>Software Stack Analysis</span>
                    </h4>
                    <div className="space-y-3">
                      {analysis.current_stack.slice(0, 5).map((software) => (
                        <div key={software.name} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div>
                            <span className="text-gray-900 font-medium">{software.name}</span>
                            <p className="text-gray-600 text-sm">{software.main_functions.slice(0, 2).join(', ')}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                              {software.integrates_with.length} integrations
                            </span>
                            {selectedSoftware.includes(software.name) && (
                              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
                                ✓ In Use
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {analysis.current_stack.length > 5 && (
                        <p className="text-gray-500 text-sm text-center py-2">
                          +{analysis.current_stack.length - 5} more tools analyzed
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{selectedSoftware.length}</div>
                      <div className="text-blue-600 text-sm">Tools Selected</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{analysis.recommendations.length}</div>
                      <div className="text-blue-600 text-sm">Recommendations</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automation Intelligence */}
              {selectedSoftware.length > 0 && (
                <AutomationDetector
                  selectedSoftware={selectedSoftware}
                  leadData={leadData}
                />
              )}
            </div>
          )}
          {/* Right Panel - Only show AFTER analysis */}
          {analysis && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Smart Recommendations</h2>
                
                <div className="space-y-4">
                  {analysis.recommendations.map((rec) => (
                    <div key={rec.id} className={`bg-gray-50 rounded-lg p-4 border-l-4 hover:bg-gray-100 transition-all cursor-pointer ${
                      rec.priority === 'High' ? 'border-red-400' : 
                      rec.priority === 'Medium' ? 'border-yellow-400' : 'border-green-400'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{rec.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          rec.priority === 'High' ? 'bg-red-100 text-red-700' : 
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-green-600 font-semibold">
                          ${rec.estimated_savings.toLocaleString()}/year
                        </span>
                        <span className="text-gray-500 text-xs bg-gray-200 px-2 py-1 rounded">
                          {rec.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Share</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>PDF Report</span>
                  </button>
                  <button className="bg-gray-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Proposal</span>
                  </button>
                  <button className="bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                  <button className="bg-orange-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </button>
                </div>
              </div>
              {/* Lead Summary */}
              {leadData && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="text-gray-900 font-medium">{leadData.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employees:</span>
                      <span className="text-gray-900 font-medium">{leadData.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="text-gray-900 font-medium">{leadData.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}