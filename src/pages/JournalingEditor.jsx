import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { Save, MoreHorizontal } from 'lucide-react';
import './JournalingEditor.css';

const JournalingEditor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedPrompt = location.state?.selectedPrompt;

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    // Format current date and time
    const now = new Date();
    const formattedDate = `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const handleSave = () => {
        // Here you would typically save to the backend.
        // For now, we'll just navigate back to the journaling home.
        navigate('/dashboard/journaling');
    };

    return (
        <DashboardLayout>
            <div className="journaling-editor-page">
                {/* Header Area */}
                <header className="editor-header">
                    <div className="editor-actions">
                        <button className="icon-btn" onClick={handleSave} title="Save Entry">
                            <Save size={20} />
                        </button>
                        <button className="icon-btn" title="More Options">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </header>

                {/* Main Editing Area */}
                <main className="editor-main">
                    <input
                        type="text"
                        className="editor-title-input"
                        placeholder="Untitled Entry"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    {selectedPrompt && (
                        <div className="editor-inline-prompt">
                            <span className="editor-prompt-text">{selectedPrompt}</span>
                        </div>
                    )}
                    <textarea
                        className="editor-body-textarea"
                        placeholder="Start writing here... Let your thoughts flow freely."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                </main>

                <footer className="editor-bottom-meta">
                    <div className="signature-line">
                        <span className="written-by">Written by Me</span>
                        <div className="editor-meta">
                            <span className="editor-date">{formattedDate}</span>
                            <span className="editor-dot">•</span>
                            <span className="editor-time">{formattedTime}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </DashboardLayout>
    );
};

export default JournalingEditor;
