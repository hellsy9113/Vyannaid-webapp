import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Sparkles } from 'lucide-react';
import { useReveal } from '../../utils/useReveal';
import './CTA.css';

const CTA = () => {
    useReveal();

    return (
        <section className="cta-section">
            <div className="cta-container" data-reveal>
                {/* Decorative Elements */}
                <div className="cta-glow"></div>
                <Sun size={240} className="cta-sun-icon" />
                <Sparkles size={40} className="cta-sparkle-icon" />

                <div className="cta-content">
                    <h2 className="cta-heading">
                        Ready to wake up to a <br /> 
                        <span className="cta-accent">healthier campus?</span>
                    </h2>

                    <p className="cta-desc">
                        Join thousands of students who have started their journey towards 
                        mental brightness. Available now at 45 universities.
                    </p>

                    <div className="cta-actions">
                        <Link to="/register" className="btn-cta-primary transition-all">
                            Create Free Account
                        </Link>

                        <button className="btn-cta-secondary transition-all">
                            For Universities
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
