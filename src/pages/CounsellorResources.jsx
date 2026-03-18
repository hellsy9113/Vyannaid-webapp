import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, MoreVertical, ChevronLeft, ChevronRight, FileText, Share2, ExternalLink, Download, Layout, Book, Video, File } from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import './CounsellorResources.css';

const initialResources = [
  { _id: '1', title: 'Coping with Exam Anxiety', type: 'PDF', category: 'Mental Health', description: 'A guide for students on managing stress during finals.', addedDate: '2024-03-10T10:00:00Z', sharedCount: 12 },
  { _id: '2', title: 'Productivity Techniques', type: 'Article', category: 'Academics', description: 'Pomodoro, Time Blocking, and more.', addedDate: '2024-03-12T14:30:00Z', sharedCount: 8 },
  { _id: '3', title: 'Mindfulness Meditation', type: 'Video', category: 'Mental Health', description: '10-minute guided session for beginners.', addedDate: '2024-03-14T09:15:00Z', sharedCount: 25 },
  { _id: '4', title: 'Career Paths in STEM', type: 'PDF', category: 'Career', description: 'Industry insights and required skills.', addedDate: '2024-03-15T11:45:00Z', sharedCount: 5 },
  { _id: '5', title: 'Sleep Hygiene Checklist', type: 'Link', category: 'Lifestyle', description: 'Best practices for better sleep.', addedDate: '2024-03-16T16:20:00Z', sharedCount: 18 },
  { _id: '6', title: 'Active Listening Basics', type: 'Article', category: 'Social/Family', description: 'Improving communication in relationships.', addedDate: '2024-03-17T13:00:00Z', sharedCount: 9 },
];

const CounsellorResources = () => {
  const [resources, setResources] = useState(initialResources);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Resources');
  const [showEditor, setShowEditor] = useState(false);
  const [selRes, setSelRes] = useState(null);
  const [toast, setToast] = useState('');
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('PDF');
  const [formCategory, setFormCategory] = useState('Mental Health');
  const [formDesc, setFormDesc] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.description.toLowerCase().includes(search.toLowerCase());
      const matchFilter = activeFilter === 'All Resources' || r.category === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [resources, search, activeFilter]);

  const stats = useMemo(() => ({
    total: resources.length,
    mostShared: resources.sort((a, b) => b.sharedCount - a.sharedCount)[0]?.title || 'None',
    thisMonth: resources.length // Mocked for demonstration
  }), [resources]);

  const handleOpenRes = (res) => {
    setSelRes(res);
    setFormTitle(res.title);
    setFormType(res.type);
    setFormCategory(res.category);
    setFormDesc(res.description);
    setShowEditor(true);
  };

  const handleNewRes = () => {
    setSelRes(null);
    setFormTitle('');
    setFormType('PDF');
    setFormCategory('Mental Health');
    setFormDesc('');
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      showToast('Title is required.');
      return;
    }
    if (selRes) {
      setResources(prev => prev.map(r => r._id === selRes._id ? { ...r, title: formTitle, type: formType, category: formCategory, description: formDesc } : r));
      showToast('Resource updated.');
    } else {
      const newR = {
        _id: Math.random().toString(36).substr(2, 9),
        title: formTitle,
        type: formType,
        category: formCategory,
        description: formDesc,
        addedDate: new Date().toISOString(),
        sharedCount: 0
      };
      setResources(prev => [newR, ...prev]);
      showToast('Resource added.');
    }
    setShowEditor(false);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resource?')) return;
    setResources(prev => prev.filter(r => r._id !== id));
    showToast('Resource deleted.');
  };

  const getIcon = (type) => {
    switch (type.toUpperCase()) {
      case 'PDF': return <File size={20} />;
      case 'VIDEO': return <Video size={20} />;
      case 'ARTICLE': return <Book size={20} />;
      case 'LINK': return <ExternalLink size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getBadgeClass = (cat) => cat.toLowerCase().replace('/', '-').replace(' ', '-');

  return (
    <CounsellorLayout>
      <div className="rep-container">
        {toast && <div className="cn-toast">{toast}</div>}

        <div className="rep-header">
          <div>
            <h1 className="rep-title">Resource Library</h1>
            <p className="rep-subtitle">Manage and share {resources.length} helpful materials with students</p>
          </div>
          <button className="rep-create-btn" onClick={handleNewRes}>
            <Plus size={18} /> Add New Resource
          </button>
        </div>

        <div className="rep-controls">
          <div className="rep-search-wrapper">
            <Search className="rep-search-icon" size={18} />
            <input
              type="text"
              className="rep-search-input"
              placeholder="Search by title, category, or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="rep-search-kbd">⌘ K</span>
          </div>
        </div>

        <div className="rep-filter-chips">
          {['All Resources', 'Mental Health', 'Academics', 'Lifestyle', 'Career', 'Social/Family'].map(f => (
            <button 
              key={f} 
              className={`rep-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="rep-main-grid">
          {filteredResources.length === 0 ? (
            <div className="rep-empty-cell">No resources found.</div>
          ) : (
            filteredResources.map(r => (
              <div key={r._id} className="rep-res-card" onClick={() => handleOpenRes(r)}>
                <div className="rep-card-top">
                  <div className={`rep-icon-box ${r.type.toLowerCase()}`}>{getIcon(r.type)}</div>
                  <div className="rep-actions">
                    <button className="rep-action-btn" title="Share with student" onClick={(e) => {e.stopPropagation(); showToast('Sharing feature coming soon!');}}>
                      <Share2 size={16} />
                    </button>
                    <button className="rep-action-btn" onClick={(e) => handleDelete(e, r._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="rep-card-content">
                  <h3 className="rep-res-title">{r.title}</h3>
                  <p className="rep-res-description">{r.description}</p>
                </div>

                <div className="rep-card-meta">
                  <span className={`res-badge ${getBadgeClass(r.category)}`}>
                    {r.category}
                  </span>
                  <span className="rep-card-date">
                    {new Date(r.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rep-footer">
          <span className="rep-pagination-info">Showing 1 to {filteredResources.length} of {resources.length} entries</span>
          <div className="rep-pagination-btns">
            <button className="rep-pag-btn"><ChevronLeft size={16} /> Previous</button>
            <button className="rep-pag-btn next">Next <ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="rep-stats-grid">
          <div className="rep-stat-card">
            <span className="stat-label">TOTAL RESOURCES</span>
            <span className="stat-number">{stats.total}</span>
            <p className="stat-desc">Materials in your library</p>
          </div>
          <div className="rep-stat-card">
            <span className="stat-label">MOST SHARED</span>
            <span className="stat-number" style={{ fontSize: '1.25rem' }}>{stats.mostShared}</span>
            <p className="stat-desc">Top performing resource</p>
          </div>
          <div className="rep-stat-card">
            <span className="stat-label">TRENDING</span>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="stat-number">+{stats.thisMonth}</span>
              <span className="stat-trend success">new</span>
            </div>
            <p className="stat-desc">Added recently</p>
          </div>
        </div>

        {/* Resource Editor Drawer */}
        {showEditor && (
          <div className="rep-drawer-overlay" onClick={() => setShowEditor(false)}>
            <div className="rep-drawer" onClick={e => e.stopPropagation()}>
              <div className="rep-drawer-header">
                <div className="rep-drawer-title-group">
                  <Layout size={20} />
                  <h2>{selRes ? 'Review Resource' : 'Add Resource'}</h2>
                </div>
                <button className="rep-close-btn" onClick={() => setShowEditor(false)}>&times;</button>
              </div>
              
              <div className="rep-drawer-body">
                <div className="rep-field">
                  <label>Title</label>
                  <input 
                    className="rep-input" 
                    placeholder="Enter resource title..." 
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="rep-field" style={{ flex: 1 }}>
                    <label>Type</label>
                    <select className="rep-input" value={formType} onChange={e => setFormType(e.target.value)}>
                      <option value="PDF">PDF Document</option>
                      <option value="Article">Article</option>
                      <option value="Video">Video Link</option>
                      <option value="Link">External Link</option>
                    </select>
                  </div>
                  <div className="rep-field" style={{ flex: 1 }}>
                    <label>Category</label>
                    <select className="rep-input" value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                      <option value="Mental Health">Mental Health</option>
                      <option value="Academics">Academics</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Career">Career</option>
                      <option value="Social/Family">Social/Family</option>
                    </select>
                  </div>
                </div>

                <div className="rep-field flex-1">
                  <label>Description</label>
                  <textarea 
                    className="rep-textarea" 
                    placeholder="Provide a brief overview of this resource..."
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="rep-drawer-footer">
                <button className="rep-cancel-btn" onClick={() => setShowEditor(false)}>Cancel</button>
                <button className="rep-save-btn" onClick={handleSave}>
                  {selRes ? 'Update Details' : 'Save Resource'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorResources;