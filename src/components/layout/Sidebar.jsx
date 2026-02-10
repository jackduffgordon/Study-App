import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Layers,
  HelpCircle,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Modules', icon: BookOpen, path: '/modules' },
    { label: 'Upload Files', icon: Upload, path: '/upload' },
    { label: 'Flashcards', icon: Layers, path: '/flashcards' },
    { label: 'Questions', icon: HelpCircle, path: '/questions' },
    { label: 'Essay Prompts', icon: FileText, path: '/essays' },
    { label: 'Friends', icon: Users, path: '/friends' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsExpanded(window.innerWidth > 768); // Keep expanded on desktop
  };

  const isActive = (path) => location.pathname === path;

  const sidebarStyle = {
    height: '100vh',
    backgroundColor: '#1a1a24',
    borderRight: '1px solid #252532',
    transition: 'width 0.3s ease',
    width: isExpanded ? '260px' : '80px',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflow: 'hidden',
    position: 'fixed',
    left: '0',
    top: '0',
    zIndex: '100',
  };

  const headerStyle = {
    padding: isExpanded ? '20px 16px' : '20px 16px',
    borderBottom: '1px solid #252532',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isExpanded ? 'space-between' : 'center',
    gap: '12px',
    height: '70px',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  };

  const logoIconStyle = {
    width: '32px',
    height: '32px',
    color: '#6c5ce7',
    flexShrink: 0,
  };

  const logoTextStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const toggleButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#a0a0b0',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  };

  const navListStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const navItemStyle = (active) => ({
    padding: isExpanded ? '12px 16px' : '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: active ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
    borderLeft: active ? '3px solid #6c5ce7' : '3px solid transparent',
    color: active ? '#6c5ce7' : '#a0a0b0',
    textDecoration: 'none',
    userSelect: 'none',
  });

  const navIconStyle = {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  };

  const navLabelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const profileSectionStyle = {
    padding: '16px 8px',
    borderTop: '1px solid #252532',
    backgroundColor: '#0f0f13',
  };

  const profileButtonStyle = {
    width: '100%',
    padding: isExpanded ? '12px 16px' : '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'none',
    border: '1px solid #252532',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#a0a0b0',
    transition: 'all 0.2s ease',
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#6c5ce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    flexShrink: 0,
  };

  const profileInfoStyle = {
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
  };

  const profileNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const profileTierStyle = {
    fontSize: '12px',
    color: '#00d2d3',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const profileDropdownStyle = {
    position: 'absolute',
    bottom: '80px',
    left: '8px',
    right: '8px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    overflow: 'hidden',
    zIndex: '101',
  };

  const dropdownItemStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #6c6c7c',
    color: '#a0a0b0',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const profileTier = profile?.subscription_tier || 'Free';

  return (
    <div style={sidebarStyle}>
      {/* Header with Logo */}
      <div style={headerStyle}>
        <div style={logoContainerStyle}>
          <GraduationCap style={logoIconStyle} />
          {isExpanded && <div style={logoTextStyle}>StudyMate</div>}
        </div>
        <button
          style={toggleButtonStyle}
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={(e) => (e.target.style.color = '#6c5ce7')}
          onMouseLeave={(e) => (e.target.style.color = '#a0a0b0')}
        >
          {isExpanded ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={navListStyle}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              style={navItemStyle(active)}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.1)';
                  e.currentTarget.style.color = '#b0a0ff';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#a0a0b0';
                }
              }}
            >
              <Icon style={navIconStyle} />
              {isExpanded && <span style={navLabelStyle}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div style={profileSectionStyle}>
        <button
          style={profileButtonStyle}
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#6c5ce7';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#252532';
            e.currentTarget.style.color = '#a0a0b0';
          }}
        >
          <div style={avatarStyle}>{getInitials(profileName)}</div>
          {isExpanded && (
            <>
              <div style={profileInfoStyle}>
                <div style={profileNameStyle}>{profileName}</div>
                <div style={profileTierStyle}>{profileTier}</div>
              </div>
              <ChevronDown size={16} />
            </>
          )}
        </button>

        {profileMenuOpen && isExpanded && (
          <div style={profileDropdownStyle}>
            <div
              style={dropdownItemStyle}
              onClick={() => {
                navigate('/profile');
                setProfileMenuOpen(false);
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3a3a48')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#252532')}
            >
              View Profile
            </div>
            <div
              style={{ ...dropdownItemStyle, borderBottom: 'none' }}
              onClick={() => {
                navigate('/settings');
                setProfileMenuOpen(false);
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3a3a48')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#252532')}
            >
              Settings
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
