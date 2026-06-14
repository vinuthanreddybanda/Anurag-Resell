import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'rgba(17, 24, 39, 0.4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#6b7280',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <p>&copy; {new Date().getFullYear()} Anurag University Resell Portal. Restricted to student registration only.</p>
      </div>
    </footer>
  );
};

export default Footer;
