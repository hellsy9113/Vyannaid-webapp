import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MoreHorizontal, Play, Pause, RotateCcw } from 'lucide-react';
import './ControlledRespiration.css';

const ControlledRespiration = () => {
    const navigate = useNavigate();

    // Timer state
    const [initialTime, setInitialTime] = useState(180); // Default to 3m
    const [timeLeft, setTimeLeft] = useState(180);
    const [isActive, setIsActive] = useState(false);

    // Dynamic Presets State
    const defaultPresets = [
        { id: 1, label: '1 Min', value: 60 },
        { id: 2, label: '3 Min', value: 180 },
        { id: 3, label: '5 Min', value: 300 }
    ];
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem('cr-presets');
        return saved ? JSON.parse(saved) : defaultPresets;
    });

    // Temporary presets for settings UI
    const [tempPresets, setTempPresets] = useState([...presets]);

    // Custom edit state
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [editMinutes, setEditMinutes] = useState("");
    const [editSeconds, setEditSeconds] = useState("");

    // Settings slidebar state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Breathing phase state
    const [phase, setPhase] = useState('Ready'); // Ready, Inhale, Exhale

    useEffect(() => {
        localStorage.setItem('cr-presets', JSON.stringify(presets));
    }, [presets]);

    useEffect(() => {
        if (isSettingsOpen) {
            setTempPresets([...presets]);
        }
    }, [isSettingsOpen, presets]);

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

    const handleSetTime = (seconds) => {
        setInitialTime(seconds);
        setTimeLeft(seconds);
        setIsActive(false);
        setIsEditingTime(false);
        setPhase('Ready');
    };

    const enableCustomEdit = () => {
        setIsActive(false);
        setIsEditingTime(true);
        setEditMinutes(Math.floor(timeLeft / 60).toString().padStart(2, '0'));
        setEditSeconds((timeLeft % 60).toString().padStart(2, '0'));
        setPhase('Ready');
    };

    const handleMinutesChange = (e) => {
        setEditMinutes(e.target.value);
    };

    const handleSecondsChange = (e) => {
        setEditSeconds(e.target.value);
    };

    const saveCustomTime = () => {
        let m = parseInt(editMinutes, 10);
        let s = parseInt(editSeconds, 10);
        if (isNaN(m)) m = 0;
        if (isNaN(s)) s = 0;
        const total = m * 60 + s;
        if (total > 0) {
            setInitialTime(total);
            setTimeLeft(total);
        } else {
            // fallback if input is 0 or invalid
            setInitialTime(60);
            setTimeLeft(60);
        }
        setIsEditingTime(false);
    };

    const resetTimer = () => {
        setTimeLeft(initialTime);
        setIsActive(false);
        setPhase('Ready');
    };

    const toggleTimer = () => {
        if (isEditingTime) {
            saveCustomTime();
        }

        if (timeLeft > 0 || isEditingTime) {
            setIsActive(!isActive);
        } else if (timeLeft === 0) {
            resetTimer();
            setIsActive(true);
        }
    };

    const handlePresetChange = (index, field, newValue) => {
        const newTempPresets = [...tempPresets];
        newTempPresets[index] = { ...newTempPresets[index], [field]: newValue };
        setTempPresets(newTempPresets);
    };

    const saveSettings = () => {
        setPresets(tempPresets);
        setIsSettingsOpen(false);
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
                <button className="cr-icon-btn" onClick={() => setIsSettingsOpen(true)} aria-label="Options">
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
                        {isEditingTime ? (
                            <input
                                type="number"
                                className="cr-time-num cr-edit-input"
                                value={editMinutes}
                                onChange={handleMinutesChange}
                                min="0"
                                max="99"
                            />
                        ) : (
                            <span className="cr-time-num">{minutes.toString().padStart(2, '0')}</span>
                        )}
                        <span className="cr-time-label">MINUTES</span>
                    </div>
                    <span className="cr-time-colon">:</span>
                    <div className="cr-time-box">
                        {isEditingTime ? (
                            <input
                                type="number"
                                className="cr-time-num cr-edit-input"
                                value={editSeconds}
                                onChange={handleSecondsChange}
                                min="0"
                                max="59"
                            />
                        ) : (
                            <span className="cr-time-num">{seconds.toString().padStart(2, '0')}</span>
                        )}
                        <span className="cr-time-label">SECONDS</span>
                    </div>
                </div>

                {/* Timer Controls */}
                <div className="cr-controls">
                    <div className="cr-time-presets">
                        {presets.map(preset => (
                            <button
                                key={preset.id}
                                className={`cr-preset-btn ${initialTime === preset.value && !isEditingTime ? 'active' : ''}`}
                                onClick={() => handleSetTime(preset.value)}
                            >
                                {preset.label}
                            </button>
                        ))}
                        <button className={`cr-preset-btn ${isEditingTime ? 'active' : ''}`} onClick={enableCustomEdit}>Custom</button>
                    </div>

                    <div className="cr-action-buttons">
                        <button className="cr-action-btn cr-play-btn" onClick={toggleTimer} aria-label={isActive ? "Pause Timer" : "Play Timer"}>
                            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="cr-play-icon" />}
                        </button>
                        <button className="cr-action-btn" onClick={resetTimer} aria-label="Reset Timer">
                            <RotateCcw size={24} />
                        </button>
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

            {/* Settings Slidebar */}
            <div className={`cr-settings-backdrop ${isSettingsOpen ? 'open' : ''}`} onClick={() => setIsSettingsOpen(false)}></div>
            <div className={`cr-settings-panel ${isSettingsOpen ? 'open' : ''}`}>
                <div className="cr-settings-header">
                    <h2>Settings</h2>
                    <button className="cr-icon-btn" onClick={() => setIsSettingsOpen(false)} aria-label="Close Settings">
                        <X size={20} />
                    </button>
                </div>
                <div className="cr-settings-content">
                    <div className="cr-setting-item">
                        <div className="cr-setting-info">
                            <span className="cr-setting-title">Sound</span>
                            <span className="cr-setting-desc">Play calming ambient sounds</span>
                        </div>
                        <label className="cr-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="cr-slider round"></span>
                        </label>
                    </div>
                    <div className="cr-setting-item">
                        <div className="cr-setting-info">
                            <span className="cr-setting-title">Haptic Feedback</span>
                            <span className="cr-setting-desc">Vibrate on inhale/exhale transition</span>
                        </div>
                        <label className="cr-switch">
                            <input type="checkbox" />
                            <span className="cr-slider round"></span>
                        </label>
                    </div>

                    <div className="cr-settings-section-title">Edit Custom Presets</div>
                    {tempPresets.map((preset, index) => (
                        <div key={preset.id} className="cr-setting-item cr-preset-edit-item">
                            <input
                                type="text"
                                className="cr-preset-edit-label"
                                value={preset.label}
                                onChange={(e) => handlePresetChange(index, 'label', e.target.value)}
                                placeholder="Button Label"
                            />
                            <div className="cr-preset-edit-time">
                                <input
                                    type="number"
                                    className="cr-preset-edit-val"
                                    value={preset.value / 60 || ''}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        handlePresetChange(index, 'value', isNaN(val) ? 0 : val * 60)
                                    }}
                                    min="1"
                                    placeholder="Min"
                                />
                                <span>min</span>
                            </div>
                        </div>
                    ))}
                    <button className="cr-save-settings-btn" onClick={saveSettings}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default ControlledRespiration;
