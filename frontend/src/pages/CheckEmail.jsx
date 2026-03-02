import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { resendVerification } from '../api/auth';

function CheckEmail() {
  const { token } = useAuthStore();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      setResent(true);
    } catch {
      // ignore
    }
    setResending(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#9993;</div>
        <h1 style={{ color: '#2c3e50' }}>Check Your Email</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '24px' }}>
          We've sent a verification link to your email address. Click the link to verify your account.
        </p>

        {resent ? (
          <p style={{ color: '#27ae60', fontWeight: '500' }}>Verification email resent!</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending || !token}
            style={{ padding: '12px 32px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            {resending ? 'Sending...' : 'Resend Email'}
          </button>
        )}

        <p style={{ marginTop: '24px', color: '#7f8c8d', fontSize: '14px' }}>
          <a href="/login">Back to Login</a>
        </p>
      </div>
    </div>
  );
}

export default CheckEmail;
