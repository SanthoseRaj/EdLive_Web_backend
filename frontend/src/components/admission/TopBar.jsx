import { Link } from 'react-router-dom';

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 14v-3a6 6 0 0 0-12 0v3" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <path d="M4 14h16" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a7 7 0 0 1 13 0" />
  </svg>
);

const TopBar = () => {
  return (
    <div className="top-bar">
      <Link to="/" className="brand">
        <span>Ed</span>
        <span className="logo-accent">Live</span>
        <span className="tagline">Your school, your view</span>
      </Link>
      <div className="top-icons">
        <button className="icon-button badged" aria-label="Notifications">
          <BellIcon />
        </button>
        <button className="icon-button" aria-label="Profile">
          <UserIcon />
        </button>
        <button className="icon-button" aria-label="Menu">
          <span className="menu-lines">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
