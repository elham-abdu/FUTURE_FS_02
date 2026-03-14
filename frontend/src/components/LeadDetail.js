import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadAPI } from '../services/api';

function LeadDetail({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getLead(id);
      setLead(response.data.data);
    } catch (err) {
      console.error('Error fetching lead:', err);
      setError('Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      let conversionValue = null;
      
      if (newStatus === 'converted') {
        conversionValue = prompt('Enter conversion value (optional):', '0');
        if (conversionValue === null) {
          setUpdating(false);
          return;
        }
        conversionValue = parseFloat(conversionValue) || 0;
      }
      
      await leadAPI.updateStatus(id, newStatus, conversionValue);
      await fetchLead(); // Refresh data
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setUpdating(true);
      await leadAPI.addNote(id, newNote);
      setNewNote('');
      await fetchLead(); // Refresh data
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadAPI.deleteLead(id);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting lead:', err);
        setError('Failed to delete lead');
      }
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      new: 'status-badge status-new',
      contacted: 'status-badge status-contacted',
      converted: 'status-badge status-converted'
    };
    return <span className={classes[status] || 'status-badge'}>{status}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !lead) {
    return (
      <div className="container">
        <div className="error">{error || 'Lead not found'}</div>
        <button className="btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="lead-detail">
        <div className="lead-header">
          <h1>{lead.name}</h1>
          <div>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn btn-danger" onClick={handleDelete} style={{ marginLeft: '10px' }}>
              Delete
            </button>
          </div>
        </div>

        <div className="lead-info">
          <div className="info-item">
            <label>Email</label>
            <div className="value">{lead.email}</div>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <div className="value">{lead.phone}</div>
          </div>
          <div className="info-item">
            <label>Source</label>
            <div className="value">{lead.source}</div>
          </div>
          <div className="info-item">
            <label>Current Status</label>
            <div className="value">{getStatusBadge(lead.status)}</div>
          </div>
          <div className="info-item">
            <label>Created</label>
            <div className="value">{formatDate(lead.created_at)}</div>
          </div>
          {lead.converted_at && (
            <div className="info-item">
              <label>Converted Date</label>
              <div className="value">{formatDate(lead.converted_at)}</div>
            </div>
          )}
          {lead.conversion_value > 0 && (
            <div className="info-item">
              <label>Conversion Value</label>
              <div className="value">${lead.conversion_value}</div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>Update Status</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              className="btn" 
              onClick={() => handleStatusChange('new')}
              disabled={updating || lead.status === 'new'}
              style={{ background: lead.status === 'new' ? '#28a745' : '#667eea' }}
            >
              New
            </button>
            <button 
              className="btn" 
              onClick={() => handleStatusChange('contacted')}
              disabled={updating || lead.status === 'contacted'}
              style={{ background: lead.status === 'contacted' ? '#28a745' : '#667eea' }}
            >
              Contacted
            </button>
            <button 
              className="btn" 
              onClick={() => handleStatusChange('converted')}
              disabled={updating || lead.status === 'converted'}
              style={{ background: lead.status === 'converted' ? '#28a745' : '#667eea' }}
            >
              Converted
            </button>
          </div>
        </div>

        <div className="notes-section">
          <h3>Follow-up Notes</h3>
          
          <div className="notes-list">
            {lead.notes && lead.notes.length > 0 ? (
              lead.notes.map((note, index) => (
                <div key={index} className="note-item">
                  <div className="note-meta">
                    <span>{note.created_by || 'Admin'}</span>
                    <span>{formatDate(note.created_at)}</span>
                  </div>
                  <div className="note-content">{note.content}</div>
                </div>
              ))
            ) : (
              <p>No notes yet</p>
            )}
          </div>

          <div className="add-note">
            <h4>Add Note</h4>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your follow-up notes here..."
            />
            <button 
              className="btn" 
              onClick={handleAddNote}
              disabled={updating || !newNote.trim()}
            >
              {updating ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadDetail;