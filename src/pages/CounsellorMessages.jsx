import React from 'react';
import { MessageSquare } from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';

const CounsellorMessages = () => (
  <CounsellorLayout>
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: '1rem', color: '#64748b'
    }}>
      <MessageSquare size={48} strokeWidth={1.5} />
      <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>Messages</h2>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>Coming soon — messaging feature is under development.</p>
    </div>
  </CounsellorLayout>
);

export default CounsellorMessages;