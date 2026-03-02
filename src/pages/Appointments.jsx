import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { Video, MoreVertical, MessageSquare, HeartHandshake, Bot, Phone } from 'lucide-react';
import './Appointments.css';

const Appointments = () => {
    const navigate = useNavigate();
    return (
        <DashboardLayout>
            <div className="appointments-page">
                {/* Header Section */}
                <div className="section-header">
                    <h2 className="section-label">CONNECT WITH CARE</h2>
                </div>

                {/* Primary Booking Card */}
                <div className="booking-hero-card">
                    <div className="booking-icon-container">
                        <Video size={24} className="video-icon" />
                    </div>
                    <div className="booking-hero-content">
                        <h3>Book Video/Chat Session</h3>
                        <p>Available therapists in your time zone are ready to support your mental well-being goals.</p>

                        <div className="booking-therapists-pill">
                            <div className="therapist-avatars">
                                <img src="https://ui-avatars.com/api/?name=Sarah+Johnson&background=1E293B&color=fff&rounded=true" alt="Therapist 1" />
                                <img src="https://ui-avatars.com/api/?name=Marcus+Chen&background=1E293B&color=fff&rounded=true" alt="Therapist 2" />
                                <div className="avatar-more">+3</div>
                            </div>
                            <div className="booking-time">
                                <span className="calendar-icon">📅</span>
                                <span>Mon 14:00 - 18:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="section-header" style={{ marginTop: '2rem' }}>
                    <h2 className="section-label">UPCOMING APPOINTMENTS</h2>
                    <a href="#" className="view-all-link">View All</a>
                </div>

                <div className="appointment-list">
                    {/* Dr. Sarah Johnson */}
                    <div className="appointment-card">
                        <div className="provider-info-block">
                            <div className="provider-avatar-container">
                                <img src="https://ui-avatars.com/api/?name=Sarah+Johnson&background=1E293B&color=fff&rounded=true&size=48" alt="Dr. Sarah Johnson" className="provider-avatar" />
                                <div className="status-dot"></div>
                            </div>
                            <div className="provider-details">
                                <h4>Dr. Sarah Johnson</h4>
                                <p>Cognitive Behavioral Therapy</p>
                                <div className="appointment-tags">
                                    <span className="time-pill tag">Today, 4:30 PM</span>
                                    <span className="format-tag tag"><Video size={14} /> Video</span>
                                </div>
                            </div>
                        </div>
                        <button className="more-btn">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    {/* Marcus Chen */}
                    <div className="appointment-card">
                        <div className="provider-info-block">
                            <div className="provider-avatar-container">
                                <img src="https://ui-avatars.com/api/?name=Marcus+Chen&background=1E293B&color=fff&rounded=true&size=48" alt="Marcus Chen, LCSW" className="provider-avatar" />
                                <div className="status-dot offline"></div>
                            </div>
                            <div className="provider-details">
                                <h4>Marcus Chen, LCSW</h4>
                                <p>Anxiety & Stress Specialist</p>
                                <div className="appointment-tags">
                                    <span className="time-pill tag">Wed, Sep 15, 10:00 AM</span>
                                    <span className="format-tag tag chat"><MessageSquare size={14} /> Chat</span>
                                </div>
                            </div>
                        </div>
                        <button className="more-btn">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Quick Actions (Navy Side-by-Side Cards) */}
                <div className="quick-actions-grid">
                    <button className="navy-action-btn" onClick={() => navigate('/dashboard/volunteer-chat')}>
                        <HeartHandshake size={20} />
                        <span>Talk to<br />Volunteer</span>
                    </button>
                    <button className="navy-action-btn" onClick={() => navigate('/dashboard/chatbot')}>
                        <Bot size={20} />
                        <span>Talk to AI<br />Companion</span>
                    </button>
                </div>

                {/* Crisis Support */}
                <div className="section-header" style={{ marginTop: '2rem' }}>
                    <h2 className="section-label">CRISIS SUPPORT</h2>
                </div>
                <div className="crisis-container">
                    <button className="crisis-trigger-btn">
                        Dial 988 Emergency
                    </button>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Appointments;
