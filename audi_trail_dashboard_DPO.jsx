import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Search, Filter, AlertTriangle, CheckCircle, Clock, Shield, 
  Globe, Database, Server, GitBranch, Mail, Lock, Activity, 
  TrendingUp, Map, FileText, EyeOff, Users, Bell, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - in production this would connect to audit log API
const mockAuditData = [
  { date: '2023-10-01', country: 'lt', events: 142, critical: 3, warnings: 12 },
  { date: '2023-10-02', country: 'lt', events: 156, critical: 1, warnings: 8 },
  { date: '2023-10-03', country: 'lt', events: 138, critical: 0, warnings: 5 },
  { date: '2023-10-04', country: 'lt', events: 172, critical: 2, warnings: 15 },
  { date: '2023-10-05', country: 'lt', events: 165, critical: 0, warnings: 7 },
  { date: '2023-10-01', country: 'lv', events: 98, critical: 2, warnings: 9 },
  { date: '2023-10-02', country: 'lv', events: 105, critical: 0, warnings: 6 },
  { date: '2023-10-03', country: 'lv', events: 112, critical: 1, warnings: 11 },
  { date: '2023-10-04', country: 'lv', events: 120, critical: 0, warnings: 4 },
  { date: '2023-10-05', country: 'lv', events: 108, critical: 3, warnings: 10 },
  { date: '2023-10-01', country: 'ee', events: 85, critical: 1, warnings: 7 },
  { date: '2023-10-02', country: 'ee', events: 92, critical: 0, warnings: 5 },
  { date: '2023-10-03', country: 'ee', events: 88, critical: 0, warnings: 3 },
  { date: '2023-10-04', country: 'ee', events: 95, critical: 2, warnings: 8 },
  { date: '2023-10-05', country: 'ee', events: 102, critical: 0, warnings: 6 },
];

const mockComplianceData = [
  { name: 'GDPR Art. 5', lt: 98, lv: 95, ee: 97, fr: 92, de: 94 },
  { name: 'GDPR Art. 6', lt: 100, lv: 98, ee: 99, fr: 95, de: 97 },
  { name: 'GDPR Art. 9', lt: 92, lv: 89, ee: 91, fr: 85, de: 88 }, // Special category data
  { name: 'Data Sovereignty', lt: 100, lv: 100, ee: 100, fr: 90, de: 92 },
  { name: 'Bitrix24 Sync', lt: 97, lv: 95, ee: 96, fr: 93, de: 94 },
];

const mockBitrixData = [
  { country: 'lt', total: 1400, synced: 1385, failed: 15, lastSync: '2023-10-05T14:23:00Z' },
  { country: 'lv', total: 1200, synced: 1180, failed: 20, lastSync: '2023-10-05T14:25:00Z' },
  { country: 'ee', total: 1100, synced: 1085, failed: 15, lastSync: '2023-10-05T14:22:00Z' },
  { country: 'fr', total: 45000, synced: 44500, failed: 500, lastSync: '2023-10-05T14:30:00Z' },
  { country: 'de', total: 38000, synced: 37600, failed: 400, lastSync: '2023-10-05T14:28:00Z' },
];

const countryNames = {
  lt: 'Lithuania',
  lv: 'Latvia',
  ee: 'Estonia',
  fr: 'France',
  de: 'Germany'
};

const COLORS = {
  lt: '#1e40af',
  lv: '#0d9488',
  ee: '#7e22ce',
  fr: '#dc2626',
  de: '#ea580c'
};

const GDPR_ARTICLES = [
  { id: 'art5', name: 'Article 5', desc: 'Data Processing Principles', critical: true },
  { id: 'art6', name: 'Article 6', desc: 'Lawfulness of Processing', critical: true },
  { id: 'art9', name: 'Article 9', desc: 'Special Category Data', critical: true, special: true },
  { id: 'art12', name: 'Article 12', desc: 'Transparency', critical: false },
  { id: 'art30', name: 'Article 30', desc: 'Record of Processing', critical: true }
];

export default function AuditTrailDashboard() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState('art30');
  const [alerts, setAlerts] = useState([]);
  const [complianceView, setComplianceView] = useState('overview');

  useEffect(() => {
    // Simulate real-time alerts - in production this would connect to audit stream
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const countries = Object.keys(countryNames);
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        
        setAlerts(prev => [
          ...prev.slice(-4),
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            country: randomCountry,
            type: Math.random() > 0.3 ? 'warning' : 'critical',
            message: Math.random() > 0.5 
              ? `Potential GDPR Art. 9 violation in ${countryNames[randomCountry]} Bitrix24 sync`
              : `Unusual data access pattern detected in ${countryNames[randomCountry]}`,
            resolved: false
          }
        ]);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredAuditData = useMemo(() => {
    return mockAuditData.filter(item => 
      (selectedCountry === 'all' || item.country === selectedCountry) &&
      item.date >= new Date(Date.now() - (timeRange === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
  }, [selectedCountry, timeRange]);

  const countryCompliance = useMemo(() => {
    return mockComplianceData.map(item => ({
      name: item.name,
      value: selectedCountry === 'all' 
        ? Object.values(item).reduce((sum, val, i) => i > 0 ? sum + val : sum, 0) / (Object.keys(item).length - 1)
        : item[selectedCountry]
    }));
  }, [selectedCountry]);

  const bitrixStatus = useMemo(() => {
    return mockBitrixData.map(item => ({
      ...item,
      successRate: Math.round((item.synced / item.total) * 100),
      failureRate: Math.round((item.failed / item.total) * 100)
    }));
  }, []);

  const getComplianceColor = (value) => {
    if (value >= 95) return 'text-green-600';
    if (value >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderComplianceChart = () => {
    if (complianceView === 'overview') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Shield className="w-5 h-5 text-indigo-600 mr-2" />
            GDPR Compliance Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Compliance by Article</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockComplianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={selectedCountry === 'all' ? 'lt' : selectedCountry} fill={COLORS[selectedCountry === 'all' ? 'lt' : selectedCountry]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Critical Articles Status</h4>
              <div className="space-y-4">
                {GDPR_ARTICLES.map(article => (
                  <div key={article.id} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{article.name}</span>
                        <span className={getComplianceColor(countryCompliance.find(c => c.name === article.name)?.value || 0)}>
                          {countryCompliance.find(c => c.name === article.name)?.value || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${article.critical ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${countryCompliance.find(c => c.name === article.name)?.value || 0}%` }}
                        ></div>
                      </div>
                      {article.special && (
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Special category data processing
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => setActiveArticle(article.id)}
                      className="ml-3 text-indigo-600 hover:text-indigo-800"
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Detailed view for specific article
    const article = GDPR_ARTICLES.find(a => a.id === activeArticle);
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 text-indigo-600 mr-2" />
              {article.name} Compliance Details
            </h3>
            <p className="text-gray-600 mt-1">{article.desc}</p>
          </div>
          <button 
            onClick={() => setComplianceView('overview')}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Back to Overview
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Compliance Status by Country</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockComplianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {Object.keys(COLORS).map(country => (
                  <Bar key={country} dataKey={country} fill={COLORS[country]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <div className="bg-indigo-50 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-indigo-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-indigo-600" />
                Critical Requirements
              </h5>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li className="flex">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  Explicit consent for special category data
                </li>
                <li className="flex">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  Data minimization principle applied
                </li>
                <li className="flex">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  Regular compliance training conducted
                </li>
                <li className="flex">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  Processing activities documented (Art. 30)
                </li>
              </ul>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium text-gray-700 mb-3">Recent Violations</h5>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Incomplete consent records</p>
                    <p className="text-xs text-gray-500">LT • 2023-10-03</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Special category data processing without DPO review</p>
                    <p className="text-xs text-gray-500">FR • 2023-10-01</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bitrix24 sync validation passed</p>
                    <p className="text-xs text-gray-500">EE • 2023-10-05</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Journey of Life - DPO Audit Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">GDPR Article 30 Record of Processing Activities</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search audit logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center border-l pl-4">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Critical Compliance Alerts</h3>
                  <div className="mt-2">
                    <ul className="pl-4 list-disc list-outside space-y-1 text-sm text-red-700">
                      {alerts.map(alert => (
                        <li key={alert.id}>
                          <span className="font-medium">{countryNames[alert.country]}:</span> {alert.message}
                          <span className="ml-2 text-xs text-gray-500">
                            ({new Date(alert.timestamp).toLocaleTimeString()})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex">
                    <button 
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                      onClick={() => setAlerts([])}
                    >
                      Acknowledge All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Overall Compliance</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">96.2%</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '96.2%' }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Within acceptable threshold</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Countries</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">5/27</p>
              </div>
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <p className="mt-2 text-xs text-gray-500">Baltic pilot phase complete</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Bitrix24 Sync</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">98.7%</p>
              </div>
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <p className="mt-2 text-xs text-gray-500">12,450 successful syncs today</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Data Sovereignty</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">100%</p>
              </div>
              <Lock className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="mt-2 text-xs text-gray-500">No cross-border data transfers</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Country:</label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Countries</option>
                {Object.entries(countryNames).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Time Range:</label>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
            
            <div className="ml-auto flex space-x-3">
              <button 
                onClick={() => setComplianceView('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  complianceView === 'overview' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Compliance Overview
              </button>
              <button 
                onClick={() => setComplianceView('audit')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  complianceView === 'audit' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Audit Logs
              </button>
              <button 
                onClick={() => setComplianceView('bitrix')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  complianceView === 'bitrix' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bitrix24 Sync
              </button>
            </div>
          </div>
        </div>

        {complianceView === 'overview' && renderComplianceChart()}

        {complianceView === 'audit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                  Audit Log Timeline
                </h3>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredAuditData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="events" stroke="#8884d8" name="Total Events" />
                    <Line type="monotone" dataKey="critical" stroke="#ff0000" name="Critical Events" />
                    <Line type="monotone" dataKey="warnings" stroke="#ffaa00" name="Warnings" />
                  </LineChart>
                </ResponsiveContainer>
                
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Audit Events</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {mockAuditData
                      .filter(item => selectedCountry === 'all' || item.country === selectedCountry)
                      .slice(-10)
                      .reverse()
                      .map((item, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {countryNames[item.country]} - {item.events} events
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(item.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {item.critical > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {item.critical} critical
                                </span>
                              )}
                              {item.warnings > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {item.warnings} warnings
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Data Access</p>
                              <p className="font-medium">{Math.floor(item.events * 0.6)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">CRM Sync</p>
                              <p className="font-medium">{Math.floor(item.events * 0.3)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Configuration</p>
                              <p className="font-medium">{Math.floor(item.events * 0.1)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Map className="w-5 h-5 text-indigo-600 mr-2" />
                  Data Sovereignty Map
                </h3>
                
                <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-64 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Globe className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Interactive EU Data Sovereignty Map</p>
                    </div>
                  </div>
                  {/* In production: embed actual map showing data centers */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-sm text-xs">
                    Legend: <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Compliant
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Database className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="font-medium">Self-hosted</span>
                    </div>
                    <span className="text-sm text-gray-600">70% of infrastructure</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Server className="w-5 h-5 text-purple-500 mr-2" />
                      <span className="font-medium">GKE</span>
                    </div>
                    <span className="text-sm text-gray-600">30% of infrastructure</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium">Data Boundaries</span>
                    </div>
                    <span className="text-sm text-gray-600">100% enforced</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <EyeOff className="w-5 h-5 text-indigo-600 mr-2" />
                  Data Processing Activities
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Church Websites</p>
                      <p className="text-sm text-gray-500">Special category data processing</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Compliant
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Funeral Services</p>
                      <p className="text-sm text-gray-500">Personal data processing</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Compliant
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Cemetery Cleaning</p>
                      <p className="text-sm text-gray-500">B2B service data</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Review needed
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="font-medium">Bitrix24 Integration</p>
                      <p className="text-sm text-gray-500">CRM synchronization</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Compliant
                    </span>
                  </div>
                </div>
                
                <button className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Generate Article 30 Report
                </button>
              </div>
            </div>
          </div>
        )}

        {complianceView === 'bitrix' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Activity className="w-5 h-5 text-indigo-600 mr-2" />
                      Bitrix24 Synchronization Monitoring
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Bi-directional sync status across all countries
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Last check: {new Date().toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Country
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Records
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sync Success
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Sync
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bitrixStatus.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 ${item.successRate >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                              <div className="text-sm font-medium text-gray-900">{countryNames[item.country]}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.successRate}%</div>
                            <div className="text-xs text-gray-500">
                              <span className="text-green-600">{item.synced.toLocaleString()}</span> / {item.total.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.lastSync).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.successRate >= 95 ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Healthy
                              </span>
                            ) : item.successRate >= 85 ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Warning
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Critical
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sync Performance Trends</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bitrixStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
                      <Bar dataKey="failureRate" fill="#ef4444" name="Failure Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <GitBranch className="w-5 h-5 text-indigo-600 mr-2" />
                  Sync Configuration
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Data Mapping Rules</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Church: Contact → Bitrix24 Contact
                      </li>
                      <li className="flex">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Funeral: Service → Bitrix24 Deal
                      </li>
                      <li className="flex">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Cleaning: Request → Bitrix24 Activity
                      </li>
                      <li className="flex">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                        GDPR Fields: Special handling required
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">GDPR Safeguards</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Automatic field masking for Lithuanian citizens
                      </li>
                      <li className="flex">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Consent status validation before sync
                      </li>
                      <li className="flex">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Audit logs for all Bitrix24 operations
                      </li>
                      <li className="flex">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        Data minimization enforced
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Sync Schedule</h4>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Real-time sync</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-3 mb-1">
                      <span>Backup sync (hourly)</span>
                      <span className="text-gray-500">Scheduled</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gray-300" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Sync Issues</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    <div className="flex">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Field mapping conflict</p>
                        <p className="text-xs text-gray-500">FR • 2023-10-03 14:23</p>
                      </div>
                    </div>
                    <div className="flex">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Consent validation failed</p>
                        <p className="text-xs text-gray-500">DE • 2023-10-02 09:15</p>
                      </div>
                    </div>
                    <div className="flex">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sync completed successfully</p>
                        <p className="text-xs text-gray-500">LT • 2023-10-05 14:23</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Bell className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-indigo-800">Bitrix24 Sync Alerts</h3>
                    <div className="mt-2">
                      <p className="text-xs text-indigo-700">
                        Configure email notifications for sync failures exceeding 5%
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                          Configure Alerts
                        </button>
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          View History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer with compliance documentation */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">GDPR Article 30 Documentation</h3>
              <p className="text-gray-600 mt-1">Complete records available for regulatory inspection</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Mail className="w-4 h-4 mr-2" />
                Request Audit
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                <FileText className="w-4 h-4 mr-2" />
                Export Compliance Report
              </button>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Data Controller</h4>
              <p className="text-sm text-gray-600">
                Journey of Life IT Services<br />
                Vilnius, Lithuania<br />
                Reg. No: 305123456
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Data Protection Officer</h4>
              <p className="text-sm text-gray-600">
                Dr. Elena Petrauskaitė<br />
                dpo@journey-of-life.com<br />
                +370 612 34567
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Last Audit</h4>
              <p className="text-sm text-gray-600">
                Conducted by: Baltic Compliance Group<br />
                Date: 2023-09-15<br />
                Status: Compliant
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuditTrailDashboard;
