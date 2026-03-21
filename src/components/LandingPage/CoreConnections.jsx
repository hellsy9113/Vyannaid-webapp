import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Diamond, ArrowUpRight } from 'lucide-react';
import { useReveal } from '../../utils/useReveal';
import './CoreConnections.css';

const Card = ({ icon: Icon, title, desc, linkText, to, accentColor, delay }) => (
    <div className="core-card transition-all" style={{"--accent": accentColor}}>
        <div className="core-icon-outer">
            <Icon size={24} className="core-icon" />
        </div>
        <h3 className="core-card-title">{title}</h3>
        <p className="core-card-desc">{desc}</p>
        <Link to={to} className="core-link transition-all">
            {linkText} <ArrowUpRight size={16} />
        </Link>
    </div>
);

const CoreConnections = () => {
    useReveal();

    return (
        <section className="core-connections-section">
            <div className="core-container">
                <div className="core-header" data-reveal>
                    <div className="section-tag">Network of Support</div>
                    <h2 className="core-title">Core Connections</h2>
                    <p className="core-desc">Three pillars of support designed to foster growth and positivity.</p>
                </div>

                <div className="cards-grid" data-reveal>
                    <Card
                        icon={Briefcase}
                        title="Professional Care"
                        desc="Instant, confidential access to campus counselors for professional guidance when you need it."
                        linkText="Learn more"
                        to="/login"
                        accentColor="#6366F1"
                    />
                    <Card
                        icon={Users}
                        title="Peer Support"
                        desc="Safe, moderated spaces to share experiences with fellow students who walk the same paths."
                        linkText="Explore communities"
                        to="/login"
                        accentColor="#F59E0B"
                    />
                    <Card
                        icon={Diamond}
                        title="Campus Harmony"
                        desc="Collaborating with university admin to evolve campus policies for a healthier student body."
                        linkText="Admin portal"
                        to="/login"
                        accentColor="#10B981"
                    />
                </div>
            </div>
        </section>
    );
};

export default CoreConnections;