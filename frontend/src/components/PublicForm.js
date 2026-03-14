import React, { useState } from 'react';
import { publicAPI } from '../services/api';

function PublicForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website'
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await publicAPI.submitLead(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        source: 'Website'
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="public-form-container">
        <div className="public-form-box">
          <h2>Thank You!</h2>
          <p className="subtitle">We've received your information and will contact you soon.</p>
          <button 
            className="btn" 
            onClick={() => setSubmitted(false)}
          >
            Submit Another Response
          </button>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="/login">Admin Login</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-form-container">
      <div className="public-form-box">
        <h2>Contact Us</h2>
        <p className="subtitle">Fill out the form and we'll get back to you!</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="555-123-4567"
            />
          </div>

          <div className="form-group">
            <label>How did you hear about us?</label>
            <select name="source" value={formData.source} onChange={handleChange}>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/login">Admin Login</a>
        </p>
      </div>
    </div>
  );
}

export default PublicForm;