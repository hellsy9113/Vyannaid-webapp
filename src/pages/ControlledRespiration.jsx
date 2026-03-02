import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MoreHorizontal } from 'lucide-react';
import './ControlledRespiration.css';

const ControlledRespiration = () => {
    const navigate = useNavigate();

    // Timer state
    const [timeLeft, setTimeLeft] = useState(270); // 4 minutes 30 seconds = 270s
    const [isActive, setIsActive] = useState(false);

    // Breathing phase state
    const [phase, setPhase] = useState('Ready'); // Ready, Inhale, Exhale

    useEffect(() => {
        let interval = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setPhase('Completed');
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Breathing cycle logic
    useEffect(() => {
        let phaseInterval = null;

        if (isActive) {
            // Start with Inhale if just became active
            if (phase === 'Ready') setPhase('Inhale');

            phaseInterval = setInterval(() => {
                setPhase(prevPhase => prevPhase === 'Inhale' ? 'Exhale' : 'Inhale');
            }, 4000); // 4 seconds per phase
        } else {
            setPhase('Ready'); // Pause resets or stops animation phase visually, or could just pause where it is. Let's say it stops.
        }

        return () => clearInterval(phaseInterval);
    }, [isActive]);

    const toggleTimer = () => {
        if (timeLeft > 0) {
            setIsActive(!isActive);
        }
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="cr-container">
            {/* Header */}
            <header className="cr-header">
                <button className="cr-icon-btn" onClick={() => navigate(-1)} aria-label="Close">
                    <X size={20} />
                </button>
                <div className="cr-brand">VYANNAID</div>
                <button className="cr-icon-btn" aria-label="Options">
                    <MoreHorizontal size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="cr-main">
                <h1 className="cr-phase-title">
                    {phase === 'Ready' && !isActive ? 'Tap to Start' : phase}
                </h1>

                {/* Breathing Circle Container */}
                <div className="cr-circle-wrapper" onClick={toggleTimer}>
                    <div className={`cr-circle-outer ${isActive ? (phase === 'Inhale' ? 'expand' : 'contract') : ''}`}>
                        <div className={`cr-circle-middle ${isActive ? (phase === 'Inhale' ? 'expand' : 'contract') : ''}`}>
                            <div className={`cr-circle-inner ${isActive ? (phase === 'Inhale' ? 'expand' : 'contract') : ''}`}>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timer Display */}
                <div className="cr-timer-wrapper">
                    <div className="cr-time-box">
                        <span className="cr-time-num">{minutes.toString().padStart(2, '0')}</span>
                        <span className="cr-time-label">MINUTES</span>
                    </div>
                    <span className="cr-time-colon">:</span>
                    <div className="cr-time-box">
                        <span className="cr-time-num">{seconds.toString().padStart(2, '0')}</span>
                        <span className="cr-time-label">SECONDS</span>
                    </div>
                </div>

                <p className="cr-instruction">
                    Focus on your breath as the circle expands and contracts. Find your natural rhythm.
                </p>
            </main>

            {/* Replace bottom spacer with a button if preferred, image shows a dark bottom region */}
            <div className="cr-bottom-bar">
                {/* <button className="cr-bottom-btn">Some action</button> */}
            </div>
        </div>
    );
};

export default ControlledRespiration;
