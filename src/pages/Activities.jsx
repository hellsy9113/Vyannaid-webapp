import React from 'react';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import AarivBanner from '../components/StudentDashboard/AarivBanner';
import { Play, Wind, PersonStanding, Headphones, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Activities.css';

const Activities = () => {
    const navigate = useNavigate();
    return (
        <DashboardLayout>
            <div className="activities-page">
                {/* 1. Page Header */}
                <div className="section-header">
                    <h2 className="page-title">Activities</h2>
                </div>

                {/* 2. Chatbot Banner (Added per user request) */}
                <AarivBanner />

                {/* 3. Hero Card: Practice of the Day */}
                <div className="practice-hero-card">
                    <div className="practice-hero-content">
                        <span className="practice-tag">PRACTICE OF THE DAY</span>
                        <h2 className="practice-title">Mindful Reflection</h2>
                        <p className="practice-desc">
                            A guided session to help you process today's emotions and find inner peace before the day ends.
                        </p>
                        <button className="start-session-btn">
                            <Play size={16} fill="currentColor" />
                            Start Session
                        </button>
                    </div>
                </div>

                {/* 4. Daily Practices List */}
                <div className="section-header" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <h2 className="section-label">DAILY PRACTICES</h2>
                    <a href="#" className="view-all-link">View All</a>
                </div>

                <div className="practices-list">
                    {/* Practice 1 */}
                    <div className="practice-item-card" onClick={() => navigate('/dashboard/controlled-respiration')} style={{ cursor: 'pointer' }}>
                        <div className="practice-icon-wrapper">
                            <Wind size={24} color="#1A2234" />
                        </div>
                        <div className="practice-item-details">
                            <h4>Controlled Respiration</h4>
                            <p>5m • Calibrate response</p>
                        </div>
                        <div className="practice-arrow">›</div>
                    </div>

                    {/* Practice 2 */}
                    <div className="practice-item-card">
                        <div className="practice-icon-wrapper">
                            <PersonStanding size={24} color="#1A2234" />
                        </div>
                        <div className="practice-item-details">
                            <h4>Meditation</h4>
                            <p>10m • Guided session</p>
                        </div>
                        <div className="practice-arrow">›</div>
                    </div>

                    {/* Practice 3 */}
                    <div className="practice-item-card">
                        <div className="practice-icon-wrapper">
                            <Headphones size={24} color="#1A2234" />
                        </div>
                        <div className="practice-item-details">
                            <h4>Calm Music</h4>
                            <p>e.g. • Ambient Playlist</p>
                        </div>
                        <div className="practice-arrow">›</div>
                    </div>

                    {/* Practice 4 */}
                    <div className="practice-item-card" onClick={() => navigate('/dashboard/journaling')} style={{ cursor: 'pointer' }}>
                        <div className="practice-icon-wrapper">
                            <BookOpen size={24} color="#1A2234" />
                        </div>
                        <div className="practice-item-details">
                            <h4>Journaling</h4>
                            <p>e.g. • Reflect & Log</p>
                        </div>
                        <div className="practice-arrow">›</div>
                    </div>
                </div>

                {/* 5. Assessments Block */}
                <div className="section-header" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <h2 className="section-label">ASSESSMENTS</h2>
                </div>

                <div className="assessment-card">
                    <p className="assessment-text">Take an Assessment – Screen for mental health conditions</p>
                    <button className="assessment-action-btn">
                        Take an Assessment
                    </button>
                </div>

                {/* Intentionally removed Crisis Support block per user request */}
                <div style={{ height: '2rem' }}></div> {/* Bottom spacer padding */}
            </div>
        </DashboardLayout>
    );
};

export default Activities;
