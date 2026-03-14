import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadAPI, analyticsAPI } from '../services/api';

function Dashboard({ token, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'newest'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      
      const response = await leadAPI.getAllLeads(params);
      setLeads(response.data.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
      if (err.response?.status === 401) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getSummary();
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleLeadClick = (leadId) => {
    navigate(`/lead/${leadId}`);
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
    return date.toLocaleDateString();
  };

  if (loading && leads.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Lead Management Dashboard</h1>
        <button className="btn btn-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Leads</h3>
            <div className="number">{analytics.totalLeads}</div>
          </div>
          <div className="stat-card">
            <h3>New</h3>
            <div className="number">{analytics.newLeads}</div>
          </div>
          <div className="stat-card">
            <h3>Contacted</h3>
            <div className="number">{analytics.contactedLeads}</div>
          </div>
          <div className="stat-card">
            <h3>Converted</h3>
            <div className="number">{analytics.convertedLeads}</div>
          </div>
          <div className="stat-card">
            <h3>Conversion Rate</h3>
            <div className="number">{analytics.conversionRate}%</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        <div className="form-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name or email"
          />
        </div>

        <div className="form-group">
          <label>Sort By</label>
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="leads-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Source</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} onClick={() => handleLeadClick(lead.id)}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.source}</td>
                  <td>{getStatusBadge(lead.status)}</td>
                  <td>{formatDate(lead.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;