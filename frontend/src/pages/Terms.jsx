import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getTerms, acceptTerms } from '../api/auth';

function Terms() {
  const { user, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    getTerms().then(data => {
      setTerms(data.terms);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptTerms();
      await refreshProfile();
      navigate('/');
    } catch {
      setAccepting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>Terms & Conditions</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '24px', fontSize: '14px' }}>
        Please read and accept the terms below to continue using the app.
      </p>

      <div style={{ padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', maxHeight: '400px', overflowY: 'auto', marginBottom: '24px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {terms?.content || 'No terms available.'}
      </div>

      {user && !user.terms_accepted && (
        <button onClick={handleAccept} disabled={accepting} style={{ width: '100%', padding: '14px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '500', cursor: accepting ? 'default' : 'pointer', opacity: accepting ? 0.6 : 1 }}>
          {accepting ? 'Accepting...' : 'I Accept the Terms & Conditions'}
        </button>
      )}

      {user?.terms_accepted && (
        <p style={{ textAlign: 'center', color: '#27ae60', fontWeight: '500' }}>
          You have already accepted the terms.{' '}
          <a href="/" style={{ color: '#3498db' }}>Go back</a>
        </p>
      )}

      {!user && (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
          <a href="/login" style={{ color: '#3498db' }}>Log in</a> to accept the terms.
        </p>
      )}
    </div>
  );
}

export default Terms;
