'use client';

import { useState } from 'react';
import { 
  getIndustries, 
  analyzeIndustry, 
  getSoftwareByIndustry,
  getFrictionsByIndustry 
} from '@/lib/dataEngine';
import { AnalysisResult } from '@/types';
import { 
  Zap, 
  TrendingUp, 
  Download, 
  FileText, 
  Mail, 
  Calendar,
  Users,
  Shield,
  Target,
  BarChart3
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

  const industries = getIndustries();

  const calculateROI = () => {
    const hourlyRate = 50; // Average hourly cost
    const weeklyHours = roiData.manualHours + roiData.dataEntryHours + roiData.reportingHours;
    const annualHours = weeklyHours * 52;
    const potentialSavings = annualHours * hourlyRate * 0.7; // 70% efficiency gain
    
    setRoiData(prev => ({ ...prev, estimatedSavings: potentialSavings }));
    
    // Calculate tech maturity score
    const integrationCount = selectedSoftware.length;
    const automationScore = weeklyHours > 20 ? 20 : 40; // Lower if they do more manual work
    const stackScore = integrationCount * 5;
    const maturityScore = Math.min(100, automationScore + stackScore + 10);
    
    setTechMaturityScore(maturityScore);
  };

  const handleAnalyze = async () => {
    if (!selectedIndustry) return;
    
    setIsAnalyzing(true);
    
    try {
      // Get basic analysis from our data engine
      const result = analyzeIndustry(selectedIndustry);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AdvisorPilot</h1>
                <p className="text-blue-200">Turn Complexity Into Confidence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm">AI Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Enhanced Smart Discovery */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <h2 className="text-xl font-semibold text-white mb-6">Smart Discovery</h2>
              
              <div className="space-y-6">
                {/* Industry Selection */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Industry Vertical
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                  >
                    <option value="">Select Industry...</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry} className="text-gray-900">
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ROI Calculator Section */}
                {selectedIndustry && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-blue-400 pb-2 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>ROI Quick Assessment</span>
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
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
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-blue-300 mt-1">
                        <span>0 hrs</span>
                        <span className="font-semibold text-white">{roiData.dataEntryHours} hrs/week</span>
                        <span>40 hrs</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
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
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-blue-300 mt-1">
                        <span>0 hrs</span>
                        <span className="font-semibold text-white">{roiData.reportingHours} hrs/week</span>
                        <span>20 hrs</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">
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
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-blue-300 mt-1">
                        <span>0 hrs</span>
                        <span className="font-semibold text-white">{roiData.manualHours} hrs/week</span>
                        <span>30 hrs</span>
                      </div>
                    </div>

                    {/* ROI Display */}
                    {roiData.estimatedSavings > 0 && (
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 transform hover:scale-105 transition-all">
                        <h4 className="font-semibold text-green-400 mb-2 flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>Automation Opportunity</span>
                        </h4>
                        <p className="text-3xl font-bold text-green-300 mb-1">
                          ${Math.round(roiData.estimatedSavings).toLocaleString()}/year
                        </p>
                        <p className="text-green-200 text-sm">Potential savings through automation</p>
                        <div className="mt-2 text-xs text-green-300">
                          {Math.round((roiData.manualHours + roiData.dataEntryHours + roiData.reportingHours) * 52)} hours/year → 
                          {Math.round((roiData.manualHours + roiData.dataEntryHours + roiData.reportingHours) * 52 * 0.3)} hours/year
                        </div>
                      </div>
                    )}

                    {/* Tech Maturity Score */}
                    {techMaturityScore > 0 && (
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-400 mb-3 flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>Tech Maturity Score</span>
                        </h4>
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl font-bold text-white">{techMaturityScore}</div>
                          <div className="flex-1">
                            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                              <div 
                                className={`h-4 rounded-full transition-all duration-1000 ${
                                  techMaturityScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                  techMaturityScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 
                                  'bg-gradient-to-r from-red-400 to-red-500'
                                }`}
                                style={{ width: `${techMaturityScore}%` }}
                              ></div>
                            </div>
                            <p className="text-blue-200 text-xs mt-2">
                              {getBenchmarkText()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Current Software */}
                {selectedIndustry && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2 flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Current Software (check all that apply)</span>
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/10">
                      {getSoftwareByIndustry(selectedIndustry).slice(0, 15).map((software) => (
                        <label key={software.name} className="flex items-center space-x-3 text-sm text-white hover:bg-white/10 p-2 rounded transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSoftware.includes(software.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSoftware([...selectedSoftware, software.name]);
                              } else {
                                setSelectedSoftware(selectedSoftware.filter(s => s !== software.name));
                              }
                              calculateROI();
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="flex-1">{software.name}</span>
                          <span className="text-xs text-blue-300 opacity-60">
                            {software.integrates_with.length} integrations
                          </span>
                        </label>
                      ))}
                    </div>
                    {selectedSoftware.length > 0 && (
                      <p className="text-blue-300 text-xs mt-2">
                        ✅ {selectedSoftware.length} tools selected
                      </p>
                    )}
                  </div>
                )}

                {/* Pain Points */}
                {selectedIndustry && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Industry Pain Points (select relevant ones)
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/10">
                      {getFrictionsByIndustry(selectedIndustry).slice(0, 10).map((friction) => (
                        <label key={friction} className="flex items-center space-x-2 text-sm text-white hover:bg-white/10 p-1 rounded cursor-pointer">
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
                            className="rounded text-blue-600 focus:ring-blue-500"
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
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-xl"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Intelligence Report...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Generate Complete Analysis</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center Panel - Analysis Results */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6">AI Analysis</h2>
              
              {!analysis ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-blue-200">Select an industry and complete the assessment to see intelligent recommendations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Total Savings */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Total Opportunity Identified</span>
                    </h4>
                    <p className="text-3xl font-bold text-green-300 mb-1">
                      ${(analysis.total_savings + roiData.estimatedSavings).toLocaleString()}
                    </p>
                    <p className="text-green-200 text-sm">Annual savings potential</p>
                    <div className="mt-2 text-xs text-green-300">
                      ${analysis.total_savings.toLocaleString()} (optimization) + ${Math.round(roiData.estimatedSavings).toLocaleString()} (automation)
                    </div>
                  </div>

                  {/* Current Stack */}
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Current Software Stack Analysis</span>
                    </h4>
                    <div className="space-y-2">
                      {analysis.current_stack.slice(0, 5).map((software, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/10 p-3 rounded-lg hover:bg-white/15 transition-colors">
                          <div>
                            <span className="text-white text-sm font-medium">{software.name}</span>
                            <p className="text-blue-300 text-xs">{software.main_functions.slice(0, 2).join(', ')}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
                              {software.integrates_with.length} integrations
                            </span>
                            {selectedSoftware.includes(software.name) && (
                              <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
                                ✓ In Use
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {analysis.current_stack.length > 5 && (
                        <p className="text-blue-300 text-sm text-center py-2">
                          +{analysis.current_stack.length - 5} more tools analyzed
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">{selectedSoftware.length}</div>
                      <div className="text-blue-200 text-xs">Tools Selected</div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">{analysis.recommendations.length}</div>
                      <div className="text-blue-200 text-xs">Recommendations</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Recommendations */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6">Smart Recommendations</h2>
              
              {analysis ? (
                <div className="space-y-4">
                  {analysis.recommendations.map((rec) => (
                    <div key={rec.id} className={`bg-white/10 rounded-lg p-4 border-l-4 hover:bg-white/15 transition-all cursor-pointer ${
                      rec.priority === 'High' ? 'border-red-400' : 
                      rec.priority === 'Medium' ? 'border-yellow-400' : 'border-green-400'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm">{rec.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.priority === 'High' ? 'bg-red-500' : 
                          rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        } text-white`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-blue-200 text-xs mb-3 leading-relaxed">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-sm font-medium">
                          ${rec.estimated_savings.toLocaleString()}/year
                        </span>
                        <span className="text-blue-300 text-xs">
                          {rec.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-blue-200">Complete the assessment to see personalized recommendations</p>
                </div>
              )}
            </div>

            {/* Export Options */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Export & Share</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>PDF Report</span>
                </button>
                <button className="bg-purple-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
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

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-200 text-sm">Analyses Completed</span>
                  <span className="text-white font-semibold">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-sm">Total Savings Identified</span>
                  <span className="text-white font-semibold">$3.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-sm">Advisor Satisfaction</span>
                  <span className="text-white font-semibold">94%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}