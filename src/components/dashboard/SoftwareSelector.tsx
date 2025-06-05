// src/components/dashboard/SoftwareSelector.tsx
'use client';

import { useState } from 'react';
import { Users, CheckCircle, XCircle, Link, Plus, X } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import integrationData from '@/data/integration-data.json';
import faultToleranceData from '@/data/fault-tolerance.json';

// Type your integration data properly
const typedIntegrationData = integrationData as {[softwareName: string]: {
  integrates_with: string[];
  main_functions: string[];
  best_used_for_industries: string[];
  verified: boolean;
}};

// Type your fault tolerance data
const typedFaultTolerance = faultToleranceData as {
  name_variations: {
    [softwareName: string]: {
      variants: string[];
    }
  };
  industry_mappings: {
    [industryName: string]: {
      keywords: string[];
      required_software: string[];
      common_software: string[];
    }
  }
};

interface CustomSoftware {
  name: string;
  category: string;
  integrations: string[];
  isCustom: true;
}

interface IntegrationStatus {
  [softwareName: string]: {
    isUsed: boolean;
    integrations: {
      [integrationName: string]: boolean;
    };
  };
}

interface SoftwareSelectorProps {
  selectedIndustry: string;
  selectedSoftware: string[];
  setSelectedSoftware: (software: string[]) => void;
  onCalculateROI: () => void;
}

export default function SoftwareSelector({
  selectedIndustry,
  selectedSoftware,
  setSelectedSoftware,
  onCalculateROI
}: SoftwareSelectorProps) {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({});
  const [showIntegrationDetails, setShowIntegrationDetails] = useState<{[key: string]: boolean}>({});
  const [customSoftware, setCustomSoftware] = useState<CustomSoftware[]>([]);
  const [showAddSoftware, setShowAddSoftware] = useState(false);
  const [newSoftware, setNewSoftware] = useState({ name: '', category: '', integrations: '' });

  // Enhanced industry-relevant software filtering using fault tolerance
  const getIndustryRelevantSoftware = () => {
    const foundSoftware = new Set<string>();
    const softwareList: {
  name: string;
  main_functions: string[];
  integrates_with: string[];
  integration_count: number;
  verified: boolean;
  isCustom: boolean;
}[] = [];

    // Method 1: Check integration-data.json with improved matching
    Object.keys(typedIntegrationData).forEach(softwareName => {
      const software = typedIntegrationData[softwareName];
      
      if (software.best_used_for_industries?.length > 0) {
        const hasDirectMatch = software.best_used_for_industries.some(industry => {
          const industryLower = industry.toLowerCase();
          const selectedLower = selectedIndustry.toLowerCase();
          
          // Direct matching
          if (industryLower.includes(selectedLower) || selectedLower.includes(industryLower)) {
            return true;
          }
          
          // Insurance-specific comprehensive matching
          if (selectedLower.includes('insurance')) {
            return industryLower.includes('insurance') ||
                   industryLower.includes('property') ||
                   industryLower.includes('casualty') ||
                   industryLower.includes('agencies') ||
                   industryLower.includes('agency') ||
                   industryLower.includes('p&c') ||
                   industryLower.includes('pc') ||
                   industryLower.includes('broker') ||
                   industryLower.includes('carrier') ||
                   industryLower.includes('mga') ||
                   industryLower.includes('wholesale') ||
                   industryLower.includes('retail') ||
                   industryLower.includes('commercial') ||
                   industryLower.includes('personal') ||
                   industryLower.includes('life') ||
                   industryLower.includes('health') ||
                   industryLower.includes('claims') ||
                   industryLower.includes('underwriting');
          }
          
          return false;
        });
        
        if (hasDirectMatch) {
          foundSoftware.add(softwareName);
          softwareList.push({
            name: softwareName,
            main_functions: software.main_functions,
            integrates_with: software.integrates_with,
            integration_count: software.integrates_with.length,
            verified: software.verified,
            isCustom: false
          });
        }
      }
    });

    // Method 2: Check fault-tolerance industry mappings
    const industryMapping = typedFaultTolerance.industry_mappings?.[selectedIndustry];
    if (industryMapping) {
      // Add required software for this industry
      industryMapping.required_software.forEach(softwareName => {
        if (!foundSoftware.has(softwareName) && typedIntegrationData[softwareName]) {
          foundSoftware.add(softwareName);
          const software = typedIntegrationData[softwareName];
          softwareList.push({
            name: softwareName,
            main_functions: software.main_functions || ['Industry-specific tool'],
            integrates_with: software.integrates_with || [],
            integration_count: software.integrates_with?.length || 0,
            verified: software.verified || false,
            isCustom: false
          });
        }
      });
      
      // Add common software for this industry
      industryMapping.common_software.forEach(softwareName => {
        if (!foundSoftware.has(softwareName) && typedIntegrationData[softwareName]) {
          foundSoftware.add(softwareName);
          const software = typedIntegrationData[softwareName];
          softwareList.push({
            name: softwareName,
            main_functions: software.main_functions || ['Business tool'],
            integrates_with: software.integrates_with || [],
            integration_count: software.integrates_with?.length || 0,
            verified: software.verified || false,
            isCustom: false
          });
        }
      });

      // Method 3: Keyword matching for additional software
      Object.keys(typedIntegrationData).forEach(softwareName => {
        if (!foundSoftware.has(softwareName)) {
          const software = typedIntegrationData[softwareName];
          
          if (software.best_used_for_industries?.length > 0) {
            const hasKeywordMatch = software.best_used_for_industries.some(industry => {
              const industryLower = industry.toLowerCase();
              return industryMapping.keywords.some(keyword => 
                industryLower.includes(keyword.toLowerCase())
              );
            });
            
            if (hasKeywordMatch) {
              foundSoftware.add(softwareName);
              softwareList.push({
                name: softwareName,
                main_functions: software.main_functions,
                integrates_with: software.integrates_with,
                integration_count: software.integrates_with.length,
                verified: software.verified,
                isCustom: false
              });
            }
          }
        }
      });
    }

    // Add custom software
    customSoftware.forEach(custom => {
      softwareList.push({
        name: custom.name,
        main_functions: [custom.category],
        integrates_with: custom.integrations,
        integration_count: custom.integrations.length,
        verified: false,
        isCustom: true
      });
    });

    // Sort: verified first, then by integration count, then alphabetically
    return softwareList.sort((a, b) => {
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      if (a.integration_count !== b.integration_count) return b.integration_count - a.integration_count;
      return a.name.localeCompare(b.name);
    });
  };

  const availableSoftware = getIndustryRelevantSoftware();

  const handleAddCustomSoftware = () => {
    if (newSoftware.name.trim()) {
      const custom: CustomSoftware = {
        name: newSoftware.name.trim(),
        category: newSoftware.category.trim() || 'Custom Software',
        integrations: newSoftware.integrations.split(',').map(s => s.trim()).filter(s => s),
        isCustom: true
      };
      
      setCustomSoftware([...customSoftware, custom]);
      setNewSoftware({ name: '', category: '', integrations: '' });
      setShowAddSoftware(false);
      onCalculateROI();
    }
  };

  const handleSoftwareToggle = (softwareName: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedSoftware([...selectedSoftware, softwareName]);
      
      // Initialize integration status for newly selected software
      if (!integrationStatus[softwareName]) {
        const standardSoftware = typedIntegrationData[softwareName];
        const customSoft = customSoftware.find(cs => cs.name === softwareName);
        
        if (standardSoftware || customSoft) {
          const integrations: {[key: string]: boolean} = {};
          let integrationsArray: string[] = [];
          
          if (standardSoftware) {
            integrationsArray = standardSoftware.integrates_with || [];
          } else if (customSoft) {
            integrationsArray = customSoft.integrations || [];
          }
          
          integrationsArray.forEach(integration => {
            integrations[integration] = false; // Default to not integrated
          });
          
          setIntegrationStatus(prev => ({
            ...prev,
            [softwareName]: {
              isUsed: true,
              integrations
            }
          }));
        }
      }
    } else {
      setSelectedSoftware(selectedSoftware.filter(s => s !== softwareName));
      setIntegrationStatus(prev => ({
        ...prev,
        [softwareName]: { ...prev[softwareName], isUsed: false }
      }));
    }
    onCalculateROI();
  };

  const handleIntegrationToggle = (softwareName: string, integrationName: string, isIntegrated: boolean) => {
    setIntegrationStatus(prev => ({
      ...prev,
      [softwareName]: {
        ...prev[softwareName],
        integrations: {
          ...prev[softwareName]?.integrations,
          [integrationName]: isIntegrated
        }
      }
    }));
  };

  const getIntegrationStats = (softwareName: string) => {
    const status = integrationStatus[softwareName];
    if (!status) return { connected: 0, total: 0, percentage: 0 };
    
    const integrations = status.integrations || {};
    const connected = Object.values(integrations).filter(Boolean).length;
    const total = Object.keys(integrations).length;
    const percentage = total > 0 ? Math.round((connected / total) * 100) : 0;
    
    return { connected, total, percentage };
  };

  const getIntegrationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-700 bg-green-100 border-green-300';
    if (percentage >= 50) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    if (percentage > 0) return 'text-orange-700 bg-orange-100 border-orange-300';
    return 'text-red-700 bg-red-100 border-red-300';
  };

  if (!selectedIndustry) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span>Current Software Stack</span>
        <Tooltip content="Select all software your company currently uses. Add custom software if not listed." />
      </label>
      
      {/* Add Custom Software Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddSoftware(true)}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Software</span>
        </button>
      </div>

      {/* Custom Software Modal */}
      {showAddSoftware && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Add Custom Software</h4>
            <button
              onClick={() => setShowAddSoftware(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Software Name *</label>
              <input
                type="text"
                value={newSoftware.name}
                onChange={(e) => setNewSoftware({...newSoftware, name: e.target.value})}
                placeholder="e.g., Custom CRM, VoIP Provider"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={newSoftware.category}
                onChange={(e) => setNewSoftware({...newSoftware, category: e.target.value})}
                placeholder="e.g., CRM, Communication, Accounting"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Integrations (comma-separated)</label>
              <input
                type="text"
                value={newSoftware.integrations}
                onChange={(e) => setNewSoftware({...newSoftware, integrations: e.target.value})}
                placeholder="e.g., Salesforce, QuickBooks, Outlook"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddCustomSoftware}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Add Software
              </button>
              <button
                onClick={() => setShowAddSoftware(false)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
        {availableSoftware.slice(0, 25).map((software) => {
          const isSelected = selectedSoftware.includes(software.name);
          const stats = getIntegrationStats(software.name);
          const showDetails = showIntegrationDetails[software.name];
          
          return (
            <div key={software.name} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
              {/* Main Software Toggle */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSoftwareToggle(software.name, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{software.name}</span>
                      {software.verified && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                          Verified
                        </span>
                      )}
                      {software.isCustom && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{software.main_functions.slice(0, 3).join(', ')}</p>
                  </div>
                </label>
                
                <div className="flex items-center space-x-3">
                  {/* Integration Status Indicator */}
                  {isSelected && stats.total > 0 && (
                    <div className={`text-xs px-3 py-1 rounded-md border font-medium ${getIntegrationColor(stats.percentage)}`}>
                      {stats.connected}/{stats.total} integrated ({stats.percentage}%)
                    </div>
                  )}
                  
                  {/* Available Integrations Count */}
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border">
                    {software.integration_count} available
                  </span>
                  
                  {/* Show Details Toggle */}
                  {isSelected && software.integrates_with.length > 0 && (
                    <button
                      onClick={() => setShowIntegrationDetails(prev => ({
                        ...prev,
                        [software.name]: !prev[software.name]
                      }))}
                      className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      <Link className="w-3 h-3" />
                      <span>{showDetails ? 'Hide' : 'Show'} Integrations</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Integration Details */}
              {isSelected && showDetails && software.integrates_with.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700 mb-3">Integration Status:</div>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {software.integrates_with.map((integration: string) => {
                      const isIntegrated = integrationStatus[software.name]?.integrations?.[integration] || false;
                      
                      return (
                        <label key={integration} className="flex items-center space-x-3 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isIntegrated}
                            onChange={(e) => handleIntegrationToggle(software.name, integration, e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          {isIntegrated ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`flex-1 ${isIntegrated ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                            {integration}
                          </span>
                          {selectedSoftware.includes(integration) && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                              In Stack
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {availableSoftware.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No software found for this industry.</p>
            <button
              onClick={() => setShowAddSoftware(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Add your software manually
            </button>
          </div>
        )}
      </div>
      
      {/* Summary */}
      {selectedSoftware.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800 font-medium flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{selectedSoftware.length} tools selected</span>
            </span>
            
            {/* Quick Integration Stats */}
            <div className="text-blue-700 text-sm">
              {(() => {
                const totalPossible = selectedSoftware.reduce((sum, softwareName) => {
                  const standardSoftware = typedIntegrationData[softwareName];
                  const customSoft = customSoftware.find(cs => cs.name === softwareName);
                  
                  let integrationCount = 0;
                  if (standardSoftware) {
                    integrationCount = standardSoftware.integrates_with?.length || 0;
                  } else if (customSoft) {
                    integrationCount = customSoft.integrations?.length || 0;
                  }
                  
                  return sum + integrationCount;
                }, 0);
                
                const totalConnected = selectedSoftware.reduce((sum, softwareName) => {
                  const status = integrationStatus[softwareName];
                  if (!status) return sum;
                  return sum + Object.values(status.integrations || {}).filter(Boolean).length;
                }, 0);
                
                return `${totalConnected}/${totalPossible} integrations active`;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}