import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { logMood } from '../../api/moodApi';
import './MoodCheckIn.css';

const MOODS = [
  { score: 1, emoji: '😔', label: 'Awful'   },
  { score: 2, emoji: '😕', label: 'Bad'     },
  { score: 3, emoji: '😐', label: 'Okay'    },
  { score: 4, emoji: '😊', label: 'Good'    },
  { score: 5, emoji: '😄', label: 'Amazing' },
];

const TOAST_DURATION = 8; // seconds before toast auto-closes

const toBackendScore = (rating) => rating * 2;

// Only keyed to user + date — marks mood as LOGGED (not skipped)
const loggedKey = (userId) => {
  const d = new Date();
  return `mood_logged_${userId}_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
};

// sessionStorage key — clears on tab close / refresh
// Used to know if this is the very first visit this session
const seenKey = (userId) => `mood_seen_${userId}`;

const MoodCheckIn = ({ onMoodLogged }) => {
  const { user } = useAuth();

  const [popupVisible, setPopupVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [done,         setDone]         = useState(false);
  const [countdown,    setCountdown]    = useState(TOAST_DURATION);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  const toastTimerRef     = useRef(null);
  const countdownTimerRef = useRef(null);

  // On mount:
  // - Already logged today           → do nothing (no popup, no toast)
  // - Not logged, first visit today  → show popup (sessionStorage has no record)
  // - Not logged, refresh/re-login   → show toast only (sessionStorage remembers)
  useEffect(() => {
    if (!user?.id) return;

    const alreadyLogged = localStorage.getItem(loggedKey(user.id));

    if (alreadyLogged) {
      // Logged today — stay silent
      setHasLoggedToday(true);
      return;
    }

    const seenThisSession = sessionStorage.getItem(seenKey(user.id));

    if (!seenThisSession) {
      // First visit this session — show popup, mark session as seen
      sessionStorage.setItem(seenKey(user.id), '1');
      const t = setTimeout(() => setPopupVisible(true), 800);
      return () => clearTimeout(t);
    } else {
      // Refresh or re-login — show toast only, not the popup
      const t = setTimeout(() => startToast(), 800);
      return () => clearTimeout(t);
    }
  }, [user?.id]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(toastTimerRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, []);

  const startToast = () => {
    setToastVisible(true);
    setCountdown(TOAST_DURATION);

    // Countdown tick every second
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close toast after duration
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      clearInterval(countdownTimerRef.current);
    }, TOAST_DURATION * 1000);
  };

  const handleSkipForNow = () => {
    // Do NOT write to localStorage — user can be reminded again
    setPopupVisible(false);
    startToast();
  };

  const handleToastClick = () => {
    // Dismiss toast and reopen popup
    clearTimeout(toastTimerRef.current);
    clearInterval(countdownTimerRef.current);
    setToastVisible(false);
    setSelected(null);
    setDone(false);
    setTimeout(() => setPopupVisible(true), 150); // slight delay feels natural
  };

  const handleToastDismiss = (e) => {
    e.stopPropagation();
    clearTimeout(toastTimerRef.current);
    clearInterval(countdownTimerRef.current);
    setToastVisible(false);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await logMood(toBackendScore(selected));
      localStorage.setItem(loggedKey(user.id), '1');
      setHasLoggedToday(true);
      setDone(true);
      setToastVisible(false); // hide toast if it was showing
      if (onMoodLogged) onMoodLogged();
      setTimeout(() => setPopupVisible(false), 1800);
    } catch {
      setSaving(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  // Progress bar width for toast countdown
  const progressPercent = (countdown / TOAST_DURATION) * 100;

  return (
    <>
      {/* ── Mood Popup ── */}
      {popupVisible && (
        <div className="mci-overlay">
          <div className="mci-card">
            {!done ? (
              <>
                <div className="mci-top">
                  <span className="mci-wave">👋</span>
                  <h2 className="mci-greeting">
                    {firstName}, how are you feeling today?
                  </h2>
                  <p className="mci-sub">Tap an emoji to log your mood</p>
                </div>

                <div className="mci-emojis">
                  {MOODS.map((m) => (
                    <button
                      key={m.score}
                      className={`mci-emoji-btn ${selected === m.score ? 'selected' : ''}`}
                      onClick={() => setSelected(m.score)}
                      type="button"
                    >
                      <span className="mci-emoji">{m.emoji}</span>
                      <span className="mci-emoji-label">{m.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mci-actions">
                  <button
                    className="mci-submit"
                    onClick={handleSubmit}
                    disabled={!selected || saving}
                  >
                    {saving ? 'Saving…' : 'Log Mood'}
                  </button>
                  <button
                    className="mci-skip"
                    onClick={handleSkipForNow}
                    type="button"
                  >
                    Skip for now
                  </button>
                </div>
              </>
            ) : (
              <div className="mci-done">
                <span className="mci-done-emoji">
                  {MOODS.find(m => m.score === selected)?.emoji}
                </span>
                <h2 className="mci-done-title">Mood logged!</h2>
                <p className="mci-done-sub">Your vitals have been updated.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom Toast Alert ── */}
      {toastVisible && (
        <div
          className="mci-toast"
          onClick={!hasLoggedToday ? handleToastClick : undefined}
          role={!hasLoggedToday ? 'button' : undefined}
          tabIndex={!hasLoggedToday ? 0 : undefined}
          style={{ cursor: hasLoggedToday ? 'default' : 'pointer' }}
        >
          <div className="mci-toast-content">
            <span className="mci-toast-emoji">{hasLoggedToday ? '✅' : '🌿'}</span>
            <div className="mci-toast-text">
              <span className="mci-toast-title">
                {hasLoggedToday
                  ? 'Mood already logged today!'
                  : "You haven't logged your mood today"}
              </span>
              <span className="mci-toast-hint">
                {hasLoggedToday
                  ? 'Come back tomorrow for your next check-in'
                  : 'Tap to check in now'}
              </span>
            </div>
          </div>
          <button
            className="mci-toast-close"
            onClick={handleToastDismiss}
            type="button"
            aria-label="Dismiss"
          >
            ✕
          </button>
          {/* Progress bar shrinks as countdown runs */}
          <div
            className="mci-toast-progress"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </>
  );
};

export default MoodCheckIn;