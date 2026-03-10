import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sun } from 'lucide-react';
// import heroImage from '../../assets/hero-image.png'; // Need to adjust path since we are in components/LandingPage
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <div className="hero-badge">
                    New Dawn for Campus Wellness
                </div>

                <h1 className="hero-title">
                    Your Mental Wellbeing, <br />
                    <span className="hero-highlight">Connected.</span>
                </h1>

                <p className="hero-description">
                    A holistic support system for students, powered by meaningful community connections and proactive smart insights. Start your fresh chapter today.
                </p>

                <div className="hero-actions">
                    <Link to="/register" className="btn-primary">
                        Join the Community <ArrowRight size={20} />
                    </Link>

                    <button className="btn-secondary">
                        <div className="play-icon-container">
                            <Play size={14} fill="var(--color-primary)" />
                        </div>
                        Watch Story
                    </button>
                </div>
            </div>

            <div className="hero-image-container">
                <img
                    // src={heroImage}
                    alt="Students on campus"
                    className="hero-image"
                />

                {/* Floating Card */}
                <div className="floating-card bottom-left">
                    <div className="card-icon-container">
                        <Sun size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                        <div className="card-title">Daily Positivity Score</div>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                        <div className="card-subtitle">Community wellness is soaring today</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
