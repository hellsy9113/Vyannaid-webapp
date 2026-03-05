import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { Plus, Smile } from 'lucide-react';
import './JournalingHome.css';

const JournalingHome = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="journaling-page">
                {/* Header Section */}
                <div className="journaling-header-section">
                    <div className="journaling-header-text">
                        <h1 className="journaling-title">Journaling</h1>
                        <h1 className="journaling-title">Workspace</h1>
                        <p className="journaling-subtitle">Welcome back. Take a moment for yourself today.</p>
                    </div>
                    <button className="new-entry-btn" onClick={() => navigate('/dashboard/journaling/new')}>
                        <Plus size={16} />
                        New Entry
                    </button>
                </div>

                {/* Prompt of the Day Card */}
                <div className="prompt-card">
                    <span className="prompt-tag">PROMPT OF THE DAY</span>
                    <h2 className="prompt-text">
                        "How has your perspective on a personal challenge shifted over the past week?"
                    </h2>
                    <button className="respond-btn" onClick={() => navigate('/dashboard/journaling/new', { state: { selectedPrompt: "How has your perspective on a personal challenge shifted over the past week?" } })}>
                        Respond to Prompt
                    </button>
                </div>

                {/* Recent Entries Section */}
                <div className="recent-entries-header">
                    <h2 className="section-label">Recent Entries</h2>
                    <a href="#" className="view-all-link">View All</a>
                </div>

                <div className="entries-list">
                    <div className="entry-card">
                        <div className="entry-card-header">
                            <span className="entry-date">TODAY, 09:42 AM</span>
                            <Smile size={18} color="#64748b" />
                        </div>
                        <h3 className="entry-title">Finding stillness in the morning chaos</h3>
                        <p className="entry-preview">
                            I spent fifteen minutes today just watching the light chang...
                        </p>
                        <div className="entry-tags">
                            <span className="tag">MINDFULNESS</span>
                            <span className="tag">MORNING</span>
                        </div>
                    </div>
                </div>
                <div style={{ height: '2rem' }}></div>
            </div>
        </DashboardLayout>
    );
};

export default JournalingHome;
