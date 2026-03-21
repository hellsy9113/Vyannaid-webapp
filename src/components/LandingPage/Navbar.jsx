import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Sun } from 'lucide-react';
import { useAuth } from "../../auth/AuthContext";
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
        setIsOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Community', path: '/community' },
        { name: 'For Universities', path: '/universities' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon-box">
                        <Sun size={20} className="logo-icon" />
                    </div>
                    <span>Vyannaid</span>
                </Link>

                {/* Desktop Links */}
                <div className="nav-menu-desktop">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="nav-auth-desktop">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="btn-login transition-all">Sign In</Link>
                            <Link to="/register" className="btn-register transition-all">
                                Get Started <ArrowRight size={16} />
                            </Link>
                        </>
                    ) : (
                        <button onClick={handleLogout} className="btn-register transition-all">Logout</button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`}>
                <div className="mobile-menu-content">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="mobile-auth-actions">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="mobile-btn-login" onClick={() => setIsOpen(false)}>Sign In</Link>
                                <Link to="/register" className="mobile-btn-register" onClick={() => setIsOpen(false)}>Get Started</Link>
                            </>
                        ) : (
                            <button onClick={handleLogout} className="mobile-btn-register">Logout</button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
