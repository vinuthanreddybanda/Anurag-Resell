import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, KeyRound, Loader } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState(email ? 'input' : 'error'); // input, verifying, success, error
  const [message, setMessage] = useState(email ? '' : 'Verification email address is missing.');
  const [loading, setLoading] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6 || isNaN(Number(otp))) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setStatus('verifying');
    try {
      const res = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
      });
      setStatus('success');
      setMessage(res.data.message || 'Your email has been verified successfully!');
      toast.success('Account verified successfully!');
    } catch (err) {
      setStatus('input'); // return to input on error so they can retry
      toast.error(err.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          backgroundColor: '#000000',
        }}
      >
        {status === 'input' && (
          <div>
            <KeyRound size={48} style={{ color: '#818cf8', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Verify Your Email
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              We have sent a 6-digit OTP to <strong>{email}</strong>.<br /> Please enter it below to verify your account.
            </p>
            
            <form onSubmit={handleVerify}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  maxLength="6"
                  className="form-control"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    letterSpacing: '0.25em',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                Verify Account
              </button>
            </form>
          </div>
        )}

        {status === 'verifying' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader
              size={48}
              style={{
                color: '#818cf8',
                animation: 'spin 2s linear infinite',
              }}
            />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verifying Your OTP</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Please wait while we activate your account...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={56} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#34d399' }}>
              Account Activated!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-primary btn-full">
              Proceed to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle size={56} style={{ color: '#f43f5e', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fb7185' }}>
              Verification Link Error
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              {message}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/register" className="btn btn-primary btn-full">
                Register Again
              </Link>
              <Link to="/login" className="btn btn-secondary btn-full">
                Back to Login
              </Link>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default VerifyEmail;
