import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, BarChart3, AlertCircle, Activity } from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import { getCounsellorAnalytics } from '../api/counsellorApi';
import './CounsellorAnalytics.css';

/* ── Simple SVG bar chart ──────────────────────────────── */
const BarChart = ({ data, label }) => {
  if (!data?.length) return <p className="ca-no-data">No data yet.</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  const H = 100, W = 20, GAP = 14;
  const totalW = data.length * (W + GAP) - GAP;

  return (
    <div className="ca-chart-wrap">
      <svg viewBox={`0 0 ${totalW} ${H + 24}`} width="100%">
        {data.map((d, i) => {
          const barH = (d.value / max) * H;
          const x    = i * (W + GAP);
          return (
            <g key={i}>
              <rect x={x} y={0} width={W} height={H} rx="5" fill="#f1f5f9" />
              <rect x={x} y={H - barH} width={W} height={barH} rx="5" fill="#6366f1" />
              <text x={x + W / 2} y={H + 18} textAnchor="middle"
                fontSize="8" fill="#94a3b8" fontWeight="600">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ── Mood distribution donut ────────────────────────────── */
const MoodDonut = ({ good = 0, fair = 0, low = 0 }) => {
  const total = good + fair + low || 1;
  const size = 100, cx = 50, cy = 50, r = 38, stroke = 14;
  const circ = 2 * Math.PI * r;

  const slices = [
    { pct: good / total, color: '#4ade80' },
    { pct: fair / total, color: '#fbbf24' },
    { pct: low  / total, color: '#f87171' },
  ];

  let offset = 0;
  return (
    <div className="ca-donut-wrap">
      <svg viewBox="0 0 100 100" width="120" height="120">
        {slices.map((s, i) => {
          const dash = s.pct * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ}
              transform="rotate(-90 50 50)"
            />
          );
          offset += s.pct;
          return el;
        })}
        <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1a2234">
          {total}
        </text>
      </svg>
      <div className="ca-donut-legend">
        <span className="ca-dl-item"><span style={{background:'#4ade80'}} />Good ({good})</span>
        <span className="ca-dl-item"><span style={{background:'#fbbf24'}} />Fair ({fair})</span>
        <span className="ca-dl-item"><span style={{background:'#f87171'}} />Low ({low})</span>
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────── */
const CounsellorAnalytics = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCounsellorAnalytics()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <CounsellorLayout>
      <div className="ca-loading"><div className="ca-spinner" /><p>Loading analytics…</p></div>
    </CounsellorLayout>
  );

  return (
    <CounsellorLayout>
      <div className="ca-page">

        <div className="ca-header">
          <h1 className="ca-title">Analytics</h1>
          <p className="ca-sub">Cohort-level overview — all data is anonymised for student privacy.<br/>
            This report can be shared with your institution admin.
          </p>
        </div>

        {/* KPI row */}
        <div className="ca-kpi-row">
          {[
            { icon: Users,       label: 'Total Students',        value: data?.totalStudents         ?? '—' },
            { icon: Activity,    label: 'Avg Mood Score',         value: data?.avgMoodScore?.toFixed(1) ?? '—' },
            { icon: TrendingUp,  label: 'Completion Rate',        value: `${data?.completionRate ?? 0}%` },
            { icon: AlertCircle, label: 'At-Risk Students',       value: data?.atRiskStudents        ?? 0 },
            { icon: BarChart3,   label: 'Sessions This Month',    value: data?.totalSessionsThisMonth ?? '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="ca-kpi">
              <div className="ca-kpi-icon"><Icon size={18} /></div>
              <span className="ca-kpi-val">{value}</span>
              <span className="ca-kpi-lbl">{label}</span>
            </div>
          ))}
        </div>

        <div className="ca-grid">

          {/* Weekly session volume */}
          <div className="ca-card">
            <h3 className="ca-card-title">Weekly Session Volume</h3>
            <BarChart data={data?.weeklySessionVolume} />
          </div>

          {/* Mood distribution */}
          <div className="ca-card">
            <h3 className="ca-card-title">Mood Distribution</h3>
            <MoodDonut
              good={data?.moodDistribution?.good}
              fair={data?.moodDistribution?.fair}
              low={data?.moodDistribution?.low}
            />
          </div>

          {/* At-risk table */}
          <div className="ca-card ca-card-wide">
            <h3 className="ca-card-title">
              <AlertCircle size={16} className="ca-risk-icon" />
              At-Risk Students
            </h3>
            {!data?.atRiskList?.length ? (
              <p className="ca-no-data">No students flagged at risk. 🎉</p>
            ) : (
              <div className="ca-risk-table">
                <div className="ca-rt-hdr">
                  <span>Student</span>
                  <span>Mood Score</span>
                  <span>Stress Level</span>
                  <span>Last Check-in</span>
                  <span>Flag Reason</span>
                </div>
                {data.atRiskList.map((s, i) => (
                  <div key={i} className="ca-rt-row">
                    <span className="ca-rt-name">{s.name}</span>
                    <span className="ca-rt-val ca-red">{s.moodScore ?? '—'}</span>
                    <span className="ca-rt-val">{s.stressLevel ?? '—'}</span>
                    <span className="ca-rt-date">
                      {s.lastCheckIn
                        ? new Date(s.lastCheckIn).toLocaleDateString('en-GB', { day:'numeric', month:'short' })
                        : '—'}
                    </span>
                    <span className="ca-rt-flag">{s.flagReason || 'Low mood trend'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session type breakdown */}
          <div className="ca-card">
            <h3 className="ca-card-title">Session Type Breakdown</h3>
            {data?.sessionTypeBreakdown ? (
              <div className="ca-type-list">
                {Object.entries(data.sessionTypeBreakdown).map(([type, count]) => (
                  <div key={type} className="ca-type-row">
                    <span className="ca-type-name">{type}</span>
                    <div className="ca-type-bar-wrap">
                      <div
                        className="ca-type-bar"
                        style={{
                          width: `${(count / Math.max(...Object.values(data.sessionTypeBreakdown), 1)) * 100}%`
                        }}
                      />
                    </div>
                    <span className="ca-type-count">{count}</span>
                  </div>
                ))}
              </div>
            ) : <p className="ca-no-data">No session data yet.</p>}
          </div>

        </div>
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorAnalytics;