import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Volunteering.css';

const Volunteering = () => {
    const navigate = useNavigate();

    return (
        <section className="volunteering-section">
            <div className="volunteer-card" onClick={() => navigate('/dashboard/volunteer')}>
                <div className="volunteer-content">
                    <p className="section-label" style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>VOLUNTEERING</p>
                    <h4>Volunteer Application</h4>
                    <p>Support peers in the community</p>
                </div>
                <button className="volunteer-arrow-btn">
                    <ArrowRight size={24} />
                </button>
            </div>
        </section>
    );
};

export default Volunteering;
