import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Sun } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <div className="logo-icon-box">
                                <Sun size={18} />
                            </div>
                            <span>Vyannaid</span>
                        </Link>
                        <p className="footer-tagline">
                            Empowering students through proactive mental wellness and meaningful 
                            community support.
                        </p>
                        <div className="footer-socials">
                            <a href="#" className="social-link transition-all"><Twitter size={20} /></a>
                            <a href="#" className="social-link transition-all"><Github size={20} /></a>
                            <a href="#" className="social-link transition-all"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="footer-links-group">
                        <div className="links-col">
                            <h4 className="footer-heading">Platform</h4>
                            <Link to="/community" className="footer-link">Community</Link>
                            <Link to="/counsellors" className="footer-link">Find Help</Link>
                            <Link to="/resources" className="footer-link">Resources</Link>
                        </div>
                        <div className="links-col">
                            <h4 className="footer-heading">Company</h4>
                            <Link to="/about" className="footer-link">About Us</Link>
                            <Link to="/universities" className="footer-link">For Universities</Link>
                            <Link to="/contact" className="footer-link">Contact</Link>
                        </div>
                        <div className="links-col">
                            <h4 className="footer-heading">Legal</h4>
                            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                            <Link to="/terms" className="footer-link">Terms of Service</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Vyannaid. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <span className="footer-credit">Made with ❤️ for students</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
