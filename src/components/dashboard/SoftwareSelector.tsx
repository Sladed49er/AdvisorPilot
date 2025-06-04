// src/components/dashboard/SoftwareSelector.tsx
'use client';

import { useState } from 'react';
import { Users, CheckCircle, XCircle, AlertTriangle, Link } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface Software {
  name: string;
  integrates_with: string[];
  main_functions: string[];
  integration_count: number;
}

interface IntegrationStatus {
  [softwareName: string]: {
    isUsed: boolean;
    integrations: {
      [integrationName: string]: boolean; // true = already integrated, false = missing
    };
  };
}

interface SoftwareSelectorProps {
  selectedIndustry: string;
  availableSoftware: Software[];
  selectedSoftware: string[];
  setSelectedSoftware: React.Dispatch<React.SetStateAction<string[]>>;
  onCalculateROI: () => void;
}

export default function SoftwareSelector({
  selectedIndustry,
  availableSoftware,
  selectedSoftware,
  setSelectedSoftware,
  onCalculateROI
}: SoftwareSelectorProps) {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({});
  const [showIntegrationDetails, setShowIntegrationDetails] = useState<{[key: string]: boolean}>({});

  const handleSoftwareToggle = (softwareName: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedSoftware([...selectedSoftware, softwareName]);
      // Initialize integration status for newly selected software
      if (!integrationStatus[softwareName]) {
        const software = availableSoftware.find(s => s.name === softwareName);
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
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span>Current Software Stack</span>
        <Tooltip content="Select all software your company currently uses. For each tool, you can specify which integrations are already set up vs missing." />
      </label>
      
      <div className="space-y-3 max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
        {availableSoftware.slice(0, 15).map((software) => {
          const isSelected = selectedSoftware.includes(software.name);
          const stats = getIntegrationStats(software.name);
          const showDetails = showIntegrationDetails[software.name];
          
          return (
            <div key={software.name} className="bg-white rounded-lg border border-gray-200 p-3">
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
                    <span className="font-medium text-gray-900">{software.name}</span>
                    <p className="text-xs text-gray-500">{software.main_functions.slice(0, 2).join(', ')}</p>
                  </div>
                </label>
                
                <div className="flex items-center space-x-2">
                  {/* Integration Status Indicator */}
                  {isSelected && stats.total > 0 && (
                    <div className={`text-xs px-2 py-1 rounded font-medium ${getIntegrationColor(stats.percentage)}`}>
                      {stats.connected}/{stats.total} integrated ({stats.percentage}%)
                    </div>
                  )}
                  
                  {/* Available Integrations Count */}
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {software.integration_count} available
                  </span>
                  
                  {/* Show Details Toggle */}
                  {isSelected && software.integrates_with.length > 0 && (
                    <button
                      onClick={() => setShowIntegrationDetails(prev => ({
                        ...prev,
                        [software.name]: !prev[software.name]
                      }))}
                      className="text-blue-600 hover:text-blue-700 text-xs flex items-center space-x-1"
                    >
                      <Link className="w-3 h-3" />
                      <span>{showDetails ? 'Hide' : 'Show'} Integrations</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Integration Details */}
              {isSelected && showDetails && software.integrates_with.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600 mb-2 font-medium">Integration Status:</div>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {software.integrates_with.slice(0, 10).map((integration) => {
                      const isIntegrated = integrationStatus[software.name]?.integrations?.[integration] || false;
                      
                      return (
                        <label key={integration} className="flex items-center space-x-2 text-xs">
                          <input
                            type="checkbox"
                            checked={isIntegrated}
                            onChange={(e) => handleIntegrationToggle(software.name, integration, e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          {isIntegrated ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-500" />
                          )}
                          <span className={isIntegrated ? 'text-green-700' : 'text-gray-600'}>
                            {integration}
                          </span>
                        </label>
                      );
                    })}
                    {software.integrates_with.length > 10 && (
                      <div className="text-xs text-gray-500 italic">
                        +{software.integrates_with.length - 10} more integrations available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      {selectedSoftware.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>{selectedSoftware.length} tools selected</span>
            </span>
            
            {/* Quick Integration Stats */}
            <div className="text-blue-600 text-xs">
              {(() => {
                const totalPossible = selectedSoftware.reduce((sum, softwareName) => {
                  const software = availableSoftware.find(s => s.name === softwareName);
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