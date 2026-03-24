import React, { useState } from 'react';
import { Search, Download, UploadCloud, Brain, FileText, Smile, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import './Assessments.css';

const Assessments = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const Layout = isStudent ? DashboardLayout : CounsellorLayout;

  const [activeTab, setActiveTab] = useState('All Tests');

  const INVENTORY = [
    {
      id: 1,
      icon: <Brain size={20} strokeWidth={2.5} color="#475569" />,
      tag: 'CLINICAL',
      title: 'Anxiety Inventory',
      desc: 'Standardized self-report measure for quantifying clinical anxiety symptoms in academic settings.',
      time: '15 MINS'
    },
    {
      id: 2,
      icon: <Brain size={20} strokeWidth={2.5} color="#475569" />,
      tag: 'APTITUDE',
      title: 'Cognitive Aptitude',
      desc: 'Evaluating logical reasoning, spatial awareness, and problem-solving capacities.',
      time: '45 MINS'
    },
    {
      id: 3,
      icon: <Smile size={20} strokeWidth={2.5} color="#475569" />,
      tag: 'SOFT SKILLS',
      title: 'Emotional Intelligence',
      desc: 'Measuring self-awareness, social regulation, and empathy markers in adolescent students.',
      time: '25 MINS'
    },
    {
      id: 4,
      icon: <ImageIcon size={20} strokeWidth={2.5} color="#475569" />,
      tag: 'PROJECTIVE',
      title: 'Visual Association',
      desc: 'Qualitative assessment focusing on pattern recognition and subconscious bias indicators.',
      time: '20 MINS'
    }
  ];

  const ASSIGNED = [
    {
      id: 1,
      name: 'Julian Casablancas',
      test: 'Cognitive Aptitude Test',
      progress: 65,
      status: 'Due Tomorrow',
      patientId: '#4092'
    },
    {
      id: 2,
      name: 'Maya Arulpragasam',
      test: 'Anxiety Inventory (BAI)',
      progress: 12,
      status: 'Started Today',
      patientId: '#3991'
    }
  ];

  const RECENT = [
    {
      id: 1,
      name: 'David Bowie',
      test: 'EQ Profile',
      result: 'High Core',
      time: '2h ago',
      alert: false
    },
    {
      id: 2,
      name: 'Patti Smith',
      test: 'Cognitive Aptitude',
      result: '94th Percentile',
      time: 'Yesterday',
      alert: false
    },
    {
      id: 3,
      name: 'Iggy Pop',
      test: 'Anxiety Inventory',
      result: 'Action Required',
      time: 'Yesterday',
      alert: true
    }
  ];

  return (
    <Layout>
      <div className="ca-container">
        {/* Navigation Row */}
        <div className="ca-top-nav">
          <div className="ca-nav-links">
            <span className="ca-nav-label">NAVIGATION</span>
            <button 
              className={`ca-nav-btn ${activeTab === 'All Tests' ? 'active' : ''}`}
              onClick={() => setActiveTab('All Tests')}
            >
              All Tests
            </button>
            {!isStudent && (
              <button 
                className={`ca-nav-btn ${activeTab === 'Assigned' ? 'active' : ''}`}
                onClick={() => setActiveTab('Assigned')}
              >
                Assigned
              </button>
            )}
            <button 
              className={`ca-nav-btn ${activeTab === 'Results' ? 'active' : ''}`}
              onClick={() => setActiveTab('Results')}
            >
              Results
            </button>
          </div>
          <div className="ca-search-box">
            <Search size={16} className="ca-search-icon" />
            <input type="text" placeholder="Search assessments..." className="ca-search-input" />
          </div>
        </div>

        {/* Header Section */}
        <div className="ca-header">
          <div className="ca-header-text">
            <h1 className="ca-title">Psychometric Assessments</h1>
            <p className="ca-subtitle">Standardized inventory and aptitude testing suite.</p>
          </div>
          {!isStudent && (
            <div className="ca-header-actions">
              <button className="ca-btn ca-btn-secondary">Export Catalog</button>
              <button className="ca-btn ca-btn-primary">
                <FileText size={16} /> Import Protocol
              </button>
            </div>
          )}
        </div>

        {/* Main Grid Content */}
        <div className="ca-grid-layout">
          {/* Left Column - Inventory */}
          <div className="ca-inventory-section">
            <h3 className="ca-section-title">AVAILABLE INVENTORY</h3>
            <div className="ca-inventory-grid">
              {INVENTORY.map(item => (
                <div key={item.id} className="ca-card ca-inventory-card">
                  <div className="ca-card-top">
                    <div className="ca-icon-circle">{item.icon}</div>
                    <span className="ca-tag">{item.tag}</span>
                  </div>
                  <h4 className="ca-card-title">{item.title}</h4>
                  <p className="ca-card-desc">{item.desc}</p>
                  <div className="ca-card-bottom">
                    <span className="ca-time-label">⏱ {item.time}</span>
                    <button className="ca-action-link">
                      {isStudent ? 'Take Assessment' : 'Assign to Student'} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Assigned & Results */}
          <div className="ca-sidebar-section">
            {!isStudent && (
              <div className="ca-assigned-wrapper">
                <div className="ca-section-header">
                  <h3 className="ca-section-title">ASSIGNED</h3>
                  <span className="ca-section-count">3 ACTIVE</span>
                </div>
                <div className="ca-assigned-list">
                  {ASSIGNED.map(item => (
                    <div key={item.id} className="ca-assigned-item">
                      <div className="ca-assigned-top">
                        <span className="ca-assigned-name">{item.name}</span>
                        <span className="ca-assigned-id">ID: {item.patientId}</span>
                      </div>
                      <div className="ca-assigned-test">{item.test}</div>
                      <div className="ca-progress-container">
                        <div className="ca-progress-bar" style={{ width: `${item.progress}%` }}></div>
                      </div>
                      <div className="ca-assigned-bottom">
                        <span className="ca-progress-text">{item.progress}% COMPLETE</span>
                        <span className="ca-status-text">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="ca-results-wrapper">
              <div className="ca-section-header">
                <h3 className="ca-section-title">RECENT RESULTS</h3>
                <button className="ca-view-all">VIEW ALL</button>
              </div>
              <div className="ca-results-list ca-card">
                {RECENT.map((item, index) => (
                  <div key={item.id} className={`ca-result-item ${index !== RECENT.length - 1 ? 'ca-border-bottom' : ''}`}>
                    <div className="ca-result-left">
                      <span className="ca-result-name">{item.name}</span>
                      <span className="ca-result-test">{item.test}</span>
                    </div>
                    <div className="ca-result-right">
                      {!isStudent && (
                        <span className={`ca-result-score ${item.alert ? 'ca-text-red' : ''}`}>{item.result}</span>
                      )}
                      <span className="ca-result-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        {!isStudent && (
          <div className="ca-bottom-banner">
            <div className="ca-banner-content">
              <span className="ca-banner-tag">INSTITUTIONAL SUMMARY</span>
              <h2 className="ca-banner-title">Diagnostic Trend Analysis</h2>
              <p className="ca-banner-text">
                System-wide anxiety markers have shown a 12% stabilization following the implementation of the new cognitive behavioral protocol. View the full synthesis report for institutional oversight.
              </p>
            </div>
            <button className="ca-banner-btn">View Data Synthesis</button>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Assessments;
