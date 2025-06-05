// src/components/dashboard/SoftwareSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Link, Plus } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import integrationData from '@/data/integration-data.json';
import { IntegrationStatus } from '@/types';

// Type your integration data properly
const typedIntegrationData = integrationData as {[softwareName: string]: {
  integrates_with: string[];
  main_functions: string[];
  best_used_for_industries: string[];
  verified: boolean;
}};

interface IntegrationStatusInternal {
  [softwareName: string]: {
    isUsed: boolean;
    integrations: {
      [integrationName: string]: boolean; // true = already integrated, false = missing
    };
  };
}

interface SoftwareSelectorProps {
  selectedIndustry: string;
  selectedSoftware: string[];
  setSelectedSoftware: (software: string[]) => void;
  onCalculateROI: () => void;
  onIntegrationStatusChange?: (statuses: Record<string, IntegrationStatus>) => void;
}

export default function SoftwareSelector({
  selectedIndustry,
  selectedSoftware,
  setSelectedSoftware,
  onCalculateROI,
  onIntegrationStatusChange
}: SoftwareSelectorProps) {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatusInternal>({});
  const [showIntegrationDetails, setShowIntegrationDetails] = useState<{[key: string]: boolean}>({});
  const [showCustomSoftwareModal, setShowCustomSoftwareModal] = useState(false);
  const [customSoftware, setCustomSoftware] = useState({ name: '', integrations: '' });

  // Convert internal status to the format expected by dataEngine
  const convertToExternalFormat = (internalStatus: IntegrationStatusInternal): Record<string, IntegrationStatus> => {
    const externalStatus: Record<string, IntegrationStatus> = {};
    
    Object.entries(internalStatus).forEach(([softwareName, status]) => {
      if (status.isUsed) {
        const allIntegrations = Object.keys(status.integrations);
        const activeIntegrations = Object.entries(status.integrations)
          .filter(([_, isActive]) => isActive)
          .map(([name, _]) => name);

        externalStatus[softwareName] = {
          isIntegrated: activeIntegrations.length > 0,
          availableIntegrations: allIntegrations,
          activeIntegrations: activeIntegrations
        };
      }
    });

    return externalStatus;
  };

  // Notify parent whenever integration status changes
  useEffect(() => {
    if (onIntegrationStatusChange) {
      const externalFormat = convertToExternalFormat(integrationStatus);
      onIntegrationStatusChange(externalFormat);
    }
  }, [integrationStatus, onIntegrationStatusChange]);

  // Get software relevant to the selected industry from your integration data
  const getIndustryRelevantSoftware = () => {
    return Object.keys(typedIntegrationData)
      .filter(softwareName => {
        const software = typedIntegrationData[softwareName];
        
        // Only show software that's actually tagged for this industry
        return software.best_used_for_industries && software.best_used_for_industries.some(industry => {
          const normalizedIndustry = industry.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normalizedSelected = selectedIndustry.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          return normalizedIndustry.includes(normalizedSelected) || 
                 normalizedSelected.includes(normalizedIndustry);
        });
      })
      .map(softwareName => ({
        name: softwareName,
        main_functions: typedIntegrationData[softwareName].main_functions,
        integrates_with: typedIntegrationData[softwareName].integrates_with,
        integration_count: typedIntegrationData[softwareName].integrates_with.length,
        verified: typedIntegrationData[softwareName].verified
      }))
      .sort((a, b) => {
        // Sort by: verified first, then by integration count, then alphabetically
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        if (a.integration_count !== b.integration_count) return b.integration_count - a.integration_count;
        return a.name.localeCompare(b.name);
      });
  };

  const availableSoftware = getIndustryRelevantSoftware();

  const handleSoftwareToggle = (softwareName: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedSoftware([...selectedSoftware, softwareName]);
      // Initialize integration status for newly selected software
      if (!integrationStatus[softwareName]) {
        const software = typedIntegrationData[softwareName];
        if (software) {
          const integrations: {[key: string]: boolean} = {};
          software.integrates_with.forEach(integration => {
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

  const handleCustomSoftwareAdd = () => {
    if (customSoftware.name.trim()) {
      const integrations = customSoftware.integrations
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Add to selected software
      setSelectedSoftware([...selectedSoftware, customSoftware.name]);

      // Add to integration status
      const integrationsObj: {[key: string]: boolean} = {};
      integrations.forEach(integration => {
        integrationsObj[integration] = false; // Default to not integrated
      });

      setIntegrationStatus(prev => ({
        ...prev,
        [customSoftware.name]: {
          isUsed: true,
          integrations: integrationsObj
        }
      }));

      // Reset form and close modal
      setCustomSoftware({ name: '', integrations: '' });
      setShowCustomSoftwareModal(false);
      onCalculateROI();
    }
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
        <Tooltip content="Select all software your company currently uses. For each tool, you can specify which integrations are already set up vs missing." />
      </label>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
        {/* Add Custom Software Button */}
        <button
          onClick={() => setShowCustomSoftwareModal(true)}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Software</span>
        </button>

        {availableSoftware.slice(0, 50).map((software) => {
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
                    {software.integrates_with.map((integration) => {
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
                          {/* Show if this integration is also in their selected software */}
                          {selectedSoftware.includes(integration) && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                              In Stack
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  
                  {software.integrates_with.length > 15 && (
                    <div className="text-xs text-gray-500 italic mt-2 text-center">
                      Showing all {software.integrates_with.length} available integrations
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Custom Software Modal */}
      {showCustomSoftwareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Software</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Software Name
                </label>
                <input
                  type="text"
                  value={customSoftware.name}
                  onChange={(e) => setCustomSoftware(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Custom CRM, VoIP Provider"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Integrations (comma-separated)
                </label>
                <input
                  type="text"
                  value={customSoftware.integrations}
                  onChange={(e) => setCustomSoftware(prev => ({ ...prev, integrations: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Salesforce, QuickBooks, Zapier"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCustomSoftwareAdd}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Software
              </button>
              <button
                onClick={() => setShowCustomSoftwareModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                  const software = typedIntegrationData[softwareName];
                  return sum + (software?.integrates_with.length || 0);
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