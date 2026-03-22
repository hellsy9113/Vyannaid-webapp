import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Activity, Sun, ChevronRight, Zap } from 'lucide-react';
import { useReveal } from '../../utils/useReveal';
import './GentleInsights.css';

const GentleInsights = () => {
    useReveal();

    return (
        <section className="gentle-insights-section">
            <div className="insights-container">
                {/* Left Side: Visuals (Abstract UI Cards) */}
                <div className="visuals-container" data-reveal>
                    <div className="visuals-grid">
                        <div className="v-card v-card-1 transition-all">
                            <div className="v-icon-box blue">
                                <Activity size={20} />
                            </div>
                            <div className="v-content">
                                <div className="v-label">Real-time Sync</div>
                                <div className="v-val">100% Private</div>
                            </div>
                        </div>

                        <div className="v-card v-card-2 transition-all">
                            <div className="v-icon-box amber">
                                <Sun size={20} />
                            </div>
                            <div className="v-content">
                                <div className="v-label">Wellness Score</div>
                                <div className="v-val">Increasing</div>
                            </div>
                        </div>

                        <div className="v-card v-card-3 transition-all">
                            <div className="v-icon-box indigo">
                                <Zap size={20} />
                            </div>
                            <div className="v-content">
                                <div className="v-label">AI Insights</div>
                                <div className="v-val">3 New Tips</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Text */}
                <div className="text-container" data-reveal>
                    <div className="section-tag">Smart Assistance</div>
                    <h2 className="insights-heading">
                        Gentle Insights for a <br /> 
                        <span className="text-accent">Brighter Path</span>
                    </h2>
                    <p className="insights-description">
                        We use technology not to overwhelm, but to empower. By understanding your 
                        unique rhythms, we help you find balance and positivity in the fast-paced 
                        college environment.
                    </p>

                    <div className="features-list">
                        <div className="feature-item transition-all">
                            <div className="feature-icon-outer">
                                <CheckCircle size={20} className="feature-icon" />
                            </div>
                            <div className="feature-text">
                                <h4 className="feature-title">Holistic Health Sync</h4>
                                <p className="feature-desc">Connect your preferred wearables for an integrated view of your wellness.</p>
                            </div>
                        </div>
                        
                        <div className="feature-item transition-all">
                            <div className="feature-icon-outer text-amber">
                                <CheckCircle size={20} className="feature-icon" />
                            </div>
                            <div className="feature-text">
                                <h4 className="feature-title">Positivity Reports</h4>
                                <p className="feature-desc">Personalized insights that celebrate your growth and celebrate progress.</p>
                            </div>
                        </div>
                    </div>

                    <div className="insights-actions">
                        <Link to="/register" className="btn-link">
                            Explore Dashboard <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GentleInsights;
