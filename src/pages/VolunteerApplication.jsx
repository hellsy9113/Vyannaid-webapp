// import React from 'react';
// import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
// import { ShieldCheck, Users, Heart, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import './VolunteerApplication.css';

// const VolunteerApplication = () => {
//     const navigate = useNavigate();
//     const steps = [
//         {
//             icon: <MessageSquare size={24} />,
//             title: "Application",
//             description: "Tell us about your background, interests, and why you want to support fellow students."
//         },
//         {
//             icon: <ShieldCheck size={24} />,
//             title: "Vetting & Training",
//             description: "Participate in mandatory training sessions covering active listening, ethics, and boundaries."
//         },
//         {
//             icon: <Heart size={24} />,
//             title: "Start Supporting",
//             description: "Join the community and begin making a real difference in others' mental well-being."
//         }
//     ];

//     return (
//         <DashboardLayout>
//             <div className="va-container">
//                 {/* Hero Section */}
//                 <div className="va-hero">
//                     <div className="va-hero-content">
//                         <div className="va-badge">
//                             <ShieldCheck size={14} />
//                             <span>VOLLUNTEER PROGRAM</span>
//                         </div>
//                         <h1 className="va-title">Support. Listen. <span className="text-gradient">Empower.</span></h1>
//                         <p className="va-subtitle">
//                             Become a Peer Volunteer and help build a safer, more supportive space for mental health within our student community.
//                         </p>
//                         <button className="va-primary-btn" onClick={() => navigate("/dashboard/volunteer/apply")}>
//                             Apply Now <ArrowRight size={18} />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Information Grid */}
//                 <div className="va-grid">
//                     <div className="va-info-card va-how-it-works">
//                         <h2 className="va-section-title">How it Works</h2>
//                         <div className="va-steps">
//                             {steps.map((step, idx) => (
//                                 <div key={idx} className="va-step">
//                                     <div className="va-step-icon">{step.icon}</div>
//                                     <div className="va-step-text">
//                                         <h3>{step.title}</h3>
//                                         <p>{step.description}</p>
//                                     </div>
//                                     {idx < steps.length - 1 && <div className="va-step-divider" />}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="va-side-col">
//                         <div className="va-info-card va-requirements">
//                             <h2 className="va-section-title">Who can join?</h2>
//                             <ul className="va-list">
//                                 <li>
//                                     <CheckCircle2 size={18} className="va-check" />
//                                     <span>Registered students of all levels</span>
//                                 </li>
//                                 <li>
//                                     <CheckCircle2 size={18} className="va-check" />
//                                     <span>Empathetic and non-judgmental</span>
//                                 </li>
//                                 <li>
//                                     <CheckCircle2 size={18} className="va-check" />
//                                     <span>Committed to confidentiality</span>
//                                 </li>
//                                 <li>
//                                     <CheckCircle2 size={18} className="va-check" />
//                                     <span>Willing to learn and grow</span>
//                                 </li>
//                             </ul>
//                         </div>

//                         <div className="va-info-card va-chat-cta">
//                             <div className="va-cta-inner">
//                                 <Users size={32} />
//                                 <h3>Have Questions?</h3>
//                                 <p>Chat with our lead coordinators to learn more about the program.</p>
//                                 <button className="va-secondary-btn">Ask Coordinator</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </DashboardLayout>
//     );
// };

// export default VolunteerApplication;


import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { ShieldCheck, Users, Heart, MessageSquare, ArrowRight, CheckCircle2, Clock, XCircle, Loader, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyVolunteerApplication, withdrawVolunteerApplication } from '../api/volunteerApi';
import './VolunteerApplication.css';

// ── Status banner shown after a student already has an application ──────────
const ApplicationStatus = ({ application, onWithdraw, withdrawing }) => {
    const statusConfig = {
        pending: {
            icon: <Clock size={22} />,
            label: 'Under Review',
            description: 'Your application has been submitted and is currently being reviewed by our team. We\'ll get back to you soon.',
            className: 'va-status-pending'
        },
        approved: {
            icon: <CheckCircle2 size={22} />,
            label: 'Approved!',
            description: 'Congratulations! Your volunteer application has been approved. Welcome to the Vyannaid peer support team.',
            className: 'va-status-approved'
        },
        rejected: {
            icon: <XCircle size={22} />,
            label: 'Not Selected',
            description: 'Thank you for applying. Unfortunately we were unable to move forward with your application at this time.',
            className: 'va-status-rejected'
        }
    };

    const config = statusConfig[application.status];

    return (
        <div className={`va-status-card ${config.className}`}>
            <div className="va-status-header">
                <div className="va-status-icon">{config.icon}</div>
                <div>
                    <h3 className="va-status-title">Application {config.label}</h3>
                    <p className="va-status-date">
                        Submitted on {new Date(application.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
            <p className="va-status-desc">{config.description}</p>

            {application.adminNotes && (
                <div className="va-admin-notes">
                    <strong>Note from team:</strong> {application.adminNotes}
                </div>
            )}

            {/* Only allow withdrawal when pending */}
            {application.status === 'pending' && (
                <button
                    className="va-withdraw-btn"
                    onClick={onWithdraw}
                    disabled={withdrawing}
                >
                    {withdrawing
                        ? <><Loader size={15} className="vf-spinner" /> Withdrawing…</>
                        : <><Trash2 size={15} /> Withdraw Application</>
                    }
                </button>
            )}
        </div>
    );
};

// ── Main page ───────────────────────────────────────────────────────────────
const VolunteerApplication = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [withdrawing, setWithdrawing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(
        location.state?.submitted ? 'Your application has been submitted successfully!' : ''
    );

    useEffect(() => {
        getMyVolunteerApplication()
            .then(res => setApplication(res.data.data))
            .catch(err => {
                // 404 = no application yet — that's fine, show the info page
                if (err.response?.status !== 404) {
                    console.error('Error fetching application:', err);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleWithdraw = async () => {
        if (!window.confirm('Are you sure you want to withdraw your application? This cannot be undone.')) return;
        setWithdrawing(true);
        try {
            await withdrawVolunteerApplication();
            setApplication(null);
            setSuccessMessage('');
        } catch (err) {
            console.error('Withdraw failed:', err);
        } finally {
            setWithdrawing(false);
        }
    };

    const steps = [
        { icon: <MessageSquare size={24} />, title: "Application", description: "Tell us about your background, interests, and why you want to support fellow students." },
        { icon: <ShieldCheck size={24} />, title: "Vetting & Training", description: "Participate in mandatory training sessions covering active listening, ethics, and boundaries." },
        { icon: <Heart size={24} />, title: "Start Supporting", description: "Join the community and begin making a real difference in others' mental well-being." }
    ];

    return (
        <DashboardLayout>
            <div className="va-container">

                {/* Success toast after form submission */}
                {successMessage && (
                    <div className="va-success-banner">
                        <CheckCircle2 size={18} />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Hero */}
                <div className="va-hero">
                    <div className="va-hero-content">
                        <div className="va-badge">
                            <ShieldCheck size={14} />
                            <span>VOLUNTEER PROGRAM</span>
                        </div>
                        <h1 className="va-title">Support. Listen. <span className="text-gradient">Empower.</span></h1>
                        <p className="va-subtitle">
                            Become a Peer Volunteer and help build a safer, more supportive space for mental health within our student community.
                        </p>

                        {/* Loading state */}
                        {loading ? (
                            <div className="va-hero-loading">
                                <Loader size={20} className="vf-spinner" />
                                <span>Checking status…</span>
                            </div>
                        ) : application ? (
                            // Already applied — scroll hint
                            <p className="va-already-applied">
                                <CheckCircle2 size={16} /> You have an active application — see status below.
                            </p>
                        ) : (
                            // No application yet — show CTA
                            <button className="va-primary-btn" onClick={() => navigate('/dashboard/volunteer/apply')}>
                                Apply Now <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Application status card — only shown when application exists */}
                {!loading && application && (
                    <ApplicationStatus
                        application={application}
                        onWithdraw={handleWithdraw}
                        withdrawing={withdrawing}
                    />
                )}

                {/* Info Grid */}
                <div className="va-grid">
                    <div className="va-info-card va-how-it-works">
                        <h2 className="va-section-title">How it Works</h2>
                        <div className="va-steps">
                            {steps.map((step, idx) => (
                                <div key={idx} className="va-step">
                                    <div className="va-step-icon">{step.icon}</div>
                                    <div className="va-step-text">
                                        <h3>{step.title}</h3>
                                        <p>{step.description}</p>
                                    </div>
                                    {idx < steps.length - 1 && <div className="va-step-divider" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="va-side-col">
                        <div className="va-info-card va-requirements">
                            <h2 className="va-section-title">Who can join?</h2>
                            <ul className="va-list">
                                <li><CheckCircle2 size={18} className="va-check" /><span>Registered students of all levels</span></li>
                                <li><CheckCircle2 size={18} className="va-check" /><span>Empathetic and non-judgmental</span></li>
                                <li><CheckCircle2 size={18} className="va-check" /><span>Committed to confidentiality</span></li>
                                <li><CheckCircle2 size={18} className="va-check" /><span>Willing to learn and grow</span></li>
                            </ul>
                        </div>

                        <div className="va-info-card va-chat-cta">
                            <div className="va-cta-inner">
                                <Users size={32} />
                                <h3>Have Questions?</h3>
                                <p>Chat with our lead coordinators to learn more about the program.</p>
                                <button className="va-secondary-btn">Ask Coordinator</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VolunteerApplication;