import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sun, Sparkles } from 'lucide-react';
import { useReveal } from '../../utils/useReveal';
import './Hero.css';

const Hero = () => {
    useReveal();

    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-content" data-reveal>
                    <div className="hero-badge">
                        <Sparkles size={14} className="badge-icon" />
                        <span>New Dawn for Campus Wellness</span>
                    </div>

                    <h1 className="hero-title">
                        Your Mental Wellbeing, <br />
                        <span className="hero-highlight">Connected.</span>
                    </h1>

                    <p className="hero-description">
                        A holistic support system for students, powered by meaningful community 
                        connections and proactive smart insights. Start your fresh chapter today.
                    </p>

                    <div className="hero-actions">
                        <Link to="/register" className="btn-primary transition-all">
                            Join the Community <ArrowRight size={20} />
                        </Link>

                        <button className="btn-secondary transition-all">
                            <div className="play-icon-container">
                                <Play size={14} fill="var(--color-primary)" />
                            </div>
                            <span>Watch Story</span>
                        </button>
                    </div>
                </div>

                <div className="hero-visuals" data-reveal>
                    <div className="hero-image-wrapper">
                        <div className="hero-image-overlay"></div>
                        <img
                            src="https://images.unsplash.com/photo-1523240715630-991df268491c?auto=format&fit=crop&q=80&w=1000"
                            alt="Students on campus"
                            className="hero-image"
                        />
                        
                        {/* Premium Floating Card */}
                        <div className="floating-card-glass bottom-left">
                            <div className="card-icon-container">
                                <Sun size={20} className="sun-icon" />
                            </div>
                            <div className="card-content">
                                <div className="card-title">Daily Positivity</div>
                                <div className="progress-container">
                                    <div className="progress-bar">
                                        <div className="progress-fill"></div>
                                    </div>
                                    <span className="progress-label">85%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
