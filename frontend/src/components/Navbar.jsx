import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MessageSquare, PlusCircle, User, ShieldAlert, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '2px' }}>
            <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="url(#gradLogo1)" />
            <path d="M6 14V21C6 24.866 10.477 28 16 28C21.523 28 26 24.866 26 21V14L16 19L6 14Z" fill="url(#gradLogo2)" />
            <defs>
              <linearGradient id="gradLogo1" x1="2" y1="9" x2="30" y2="9" gradientUnits="userSpaceOnUse">
                <stop stopColor=" #ffffff" />
                <stop offset="1" stopColor="#ffffffff" />
              </linearGradient>
              <linearGradient id="gradLogo2" x1="6" y1="21" x2="26" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffffff" />
                <stop offset="1" stopColor="#ffffffff" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ letterSpacing: '-0.025em' }}>Anurag Resell</span>
        </Link>
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Marketplace
            </NavLink>
          </li>

          {user ? (
            <>
              <li>
                <NavLink to="/chats" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <MessageSquare size={18} />
                  Chats
                </NavLink>
              </li>
              <li>
                <NavLink to="/create-product" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <PlusCircle size={18} />
                  Sell Item
                </NavLink>
              </li>
              {user.role === 'admin' && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <ShieldAlert size={18} style={{ color: '#fb7185' }} />
                    Admin
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <User size={18} />
                  Profile
                </NavLink>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="nav-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
