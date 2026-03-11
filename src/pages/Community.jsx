import React from 'react';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import {
    Bell, User, Volume2, Users, TreePine, Moon,
    HelpCircle, Phone, ArrowRight, ArrowRightCircle
} from 'lucide-react';
import './Community.css';
import { Link, useNavigate } from 'react-router-dom';

const Community = () => {
    const navigate = useNavigate();
    return (
        <DashboardLayout>
            <div className="community-page">
                {/* Header Section */}
                <div className="community-header">
                    <div className="community-header-text">
                        <h1>Community Hub</h1>
                        <p>Connect & Support</p>
                    </div>
                </div>

                {/* Latest News */}
                <div className="section-header">
                    <h2 className="section-label">LATEST NEWS</h2>
                    <Link to="#" className="view-all-link">View all</Link>
                </div>

                <div className="card-stack">
                    <div className="base-card news-card">
                        <div className="news-icon-wrapper">
                            <Volume2 size={24} />
                        </div>
                        <div className="news-content">
                            <h3>Monthly Wellness Seminar</h3>
                            <p>Join us this Saturday for a guided session on holistic well-being with Dr. Sarah Jenkins.</p>
                            <Link to="#" className="learn-more-link">
                                Learn more about Announcements <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Discussion Forums */}
                <div className="section-header">
                    <h2 className="section-label">DISCUSSION FORUMS</h2>
                </div>

                <div className="card-stack">
                    <div className="base-card forum-card">
                        <div className="forum-info">
                            <div className="forum-icon-wrapper anxiety">
                                <Users size={24} />
                            </div>
                            <div className="forum-text">
                                <h4>Anxiety Support</h4>
                                <p>1.2k members • 24 active</p>
                            </div>
                        </div>
                        <button className="join-btn">Join</button>
                    </div>

                    <div className="base-card forum-card">
                        <div className="forum-info">
                            <div className="forum-icon-wrapper mindful">
                                <TreePine size={24} />
                            </div>
                            <div className="forum-text">
                                <h4>Mindful Living</h4>
                                <p>850 members • 12 active</p>
                            </div>
                        </div>
                        <button className="join-btn">Join</button>
                    </div>

                    <div className="base-card forum-card">
                        <div className="forum-info">
                            <div className="forum-icon-wrapper sleep">
                                <Moon size={24} />
                            </div>
                            <div className="forum-text">
                                <h4>Sleep Hygiene</h4>
                                <p>540 members • 8 active</p>
                            </div>
                        </div>
                        <button className="join-btn">Join</button>
                    </div>
                </div>

                {/* Common Questions */}
                <div className="card-stack">
                    <div className="base-card faq-card">
                        <div className="faq-card-header">
                            <h3>Common Questions</h3>
                            <HelpCircle size={20} className="faq-icon" />
                        </div>
                        <p>What are the roots and common recurring questions about our peer-led mental health program?</p>
                        <Link to="#" className="learn-more-link">
                            Learn more about community FAQs <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Crisis Support */}
                <div className="section-header">
                    <h2 className="section-label">CRISIS SUPPORT</h2>
                </div>

                <button className="crisis-btn">
                    <Phone size={20} />
                    Dial 988 Emergency
                </button>
                <p className="crisis-caption">Available 24/7 for immediate assistance</p>

                {/* Volunteering */}
                <div className="volunteer-card">
                    <div className="volunteer-content">
                        <p className="section-label" style={{ color: '#94A3B8' }}>VOLUNTEERING</p>
                        <h4>Volunteer Application</h4>
                        <p>Support peers in the community</p>
                    </div>
                    <button className="volunteer-arrow-btn" onClick={() => navigate('/dashboard/volunteer')}>
                        <ArrowRight size={24} />
                    </button>
                </div>
            </div>

        </DashboardLayout>
    );
};

export default Community;
