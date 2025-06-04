'use client';

import { useState } from 'react';
import { Users, Building, Mail, Phone, CheckCircle } from 'lucide-react';

interface LeadCaptureFormProps {
  onSubmit: (data: LeadData) => void;
}

export interface LeadData {
  name: string;
  email: string;
  company: string;
  phone: string;
  companySize: string; // Now stores exact number as string
  employeeCount: number; // Actual number for calculations
}

export default function LeadCaptureForm({ onSubmit }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    companySize: '',
    employeeCount: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company || !formData.companySize) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Convert employee count to number and determine size category
    const employeeCount = parseInt(formData.companySize);
    const sizeCategory = employeeCount <= 50 ? '1-50' : 
                        employeeCount <= 200 ? '51-200' : '200+';
    
    const finalData = {
      ...formData,
      employeeCount,
      companySize: sizeCategory
    };
    
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(finalData);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo SVG */}
          <div className="flex justify-center mb-6">
            <svg width="64" height="64" viewBox="0 0 100 100" className="text-blue-600">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"/>
              <polygon points="50,20 65,45 50,35 35,45" fill="currentColor"/>
              <polygon points="50,80 35,55 50,65 65,55" fill="currentColor"/>
              <polygon points="20,50 45,35 35,50 45,65" fill="currentColor"/>
              <polygon points="80,50 55,65 65,50 55,35" fill="currentColor"/>
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AdvisorPilot</h1>
          <p className="text-gray-600 mb-4 text-lg">Get Your Free Technology Assessment</p>
          <p className="text-gray-500">Discover $10K-$50K+ in annual savings opportunities</p>
        </div>

        {/* Benefits */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Personalized ROI analysis for your industry</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Technology maturity scoring vs industry peers</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Actionable recommendations with savings estimates</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2 text-blue-600" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 bg-white"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2 text-blue-600" />
                Business Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 bg-white"
                placeholder="your.email@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2 text-blue-600" />
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 bg-white"
                placeholder="Your Company Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2 text-blue-600" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 bg-white"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees *
              </label>
              <input
                type="number"
                min="1"
                max="50000"
                value={formData.companySize}
                onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 bg-white"
                placeholder="e.g. 25"
                required
              />
              <p className="text-gray-500 text-xs mt-1">Enter the total number of employees at your company</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-lg disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Preparing Your Assessment...</span>
                </div>
              ) : (
                'Get My Free Technology Assessment'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Your information is secure and will only be used for your assessment</span>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Join 2,800+ companies that have optimized their technology stack
          </p>
        </div>
      </div>
    </div>
  );
}