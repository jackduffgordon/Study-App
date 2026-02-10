import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User,
  Lock,
  Zap,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Check,
  HardDrive,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TIER_LIMITS } from '../lib/constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [usageStats, setUsageStats] = useState({
    uploadsUsed: 0,
    uploadLimit: 5,
    storageUsed: 0,
    storageLimit: 100,
    generationsUsed: 0,
    generationsLimit: 15,
  });
  const [profileForm, setProfileForm] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    const loadUsageStats = async () => {
      try {
        setLoading(true);

        if (!user) return;

        const { data: files } = await supabase
          .from('files')
          .select('file_size', { count: 'exact' })
          .eq('user_id', user.id);

        const storageUsed = files?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0;

        const { count: uploadCount } = await supabase
          .from('files')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        const { count: generationCount } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        const userTier = profile?.subscription_tier || 'free';
        const tierLimits = TIER_LIMITS[userTier.toLowerCase()] || TIER_LIMITS.free;

        setUsageStats({
          uploadsUsed: uploadCount || 0,
          uploadLimit: tierLimits.uploads,
          storageUsed: storageUsed || 0,
          storageLimit: tierLimits.storage,
          generationsUsed: generationCount || 0,
          generationsLimit: tierLimits.generations,
        });
      } catch (error) {
        console.error('Error loading usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsageStats();
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!profileForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setSavingProfile(true);

    try {
      const { error } = await updateProfile({
        full_name: profileForm.fullName,
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.new) {
      toast.error('Please enter a new password');
      return;
    }

    if (passwordForm.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setSavingProfile(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });

      if (error) throw error;

      toast.success('Password changed successfully!');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Failed to sign out');
      } else {
        toast.success('Signed out successfully');
        navigate('/auth');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSavingProfile(true);

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      if (authError && authError.status !== 404) throw authError;

      toast.success('Account deleted. Redirecting...');
      setTimeout(() => navigate('/auth'), 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setSavingProfile(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '600px',
        }}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0',
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const cardStyle = {
    padding: '24px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  };

  const inputStyle = {
    padding: '10px 12px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  };

  const readOnlyInputStyle = {
    ...inputStyle,
    backgroundColor: '#1a1a24',
    borderColor: '#252532',
    color: '#a0a0b0',
    cursor: 'not-allowed',
  };

  const usageBarStyle = {
    width: '100%',
    height: '8px',
    backgroundColor: '#252532',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  };

  const usageFilledStyle = (percentage) => ({
    height: '100%',
    backgroundColor:
      percentage > 90
        ? '#ff6b6b'
        : percentage > 70
        ? '#F7DC6F'
        : '#00d2d3',
    width: `${Math.min(100, percentage)}%`,
    transition: 'width 0.3s ease',
  });

  const usageInfoStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#a0a0b0',
  };

  const usageItemStyle = {
    marginBottom: '20px',
  };

  const tierBadgeStyle = {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    border: '1px solid #6c5ce7',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#6c5ce7',
    fontWeight: '500',
    marginBottom: '16px',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  };

  const dangerZoneStyle = {
    padding: '24px',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    border: '1px solid #ff6b6b',
    borderRadius: '12px',
  };

  const dangerTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ff6b6b',
    margin: '0 0 12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const dangerDescStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
    marginBottom: '16px',
  };

  const passwordInputWrapperStyle = {
    position: 'relative',
  };

  const togglePasswordStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#a0a0b0',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Settings</h1>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <User size={20} />
          Profile Settings
        </h2>

        <Card style={cardStyle}>
          <form>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, fullName: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={profileForm.email}
                disabled
                style={readOnlyInputStyle}
              />
              <div style={{ fontSize: '12px', color: '#a0a0b0' }}>
                Email cannot be changed
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleSaveProfile}
              loading={savingProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              Save Changes
            </Button>
          </form>
        </Card>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <Zap size={20} />
          Account Tier
        </h2>

        <Card style={cardStyle}>
          <div style={tierBadgeStyle}>
            {profile?.subscription_tier?.toUpperCase() || 'FREE'}
          </div>
          <p
            style={{
              fontSize: '14px',
              color: '#a0a0b0',
              margin: '0 0 16px 0',
              lineHeight: '1.6',
            }}
          >
            You're currently on the{' '}
            <strong>{profile?.subscription_tier?.toUpperCase() || 'Free'}</strong> plan.
            Upgrade your plan to unlock more features and higher limits.
          </p>

          <Button
            variant="primary"
            onClick={() => toast.info('Upgrade feature coming soon')}
          >
            Upgrade Plan
          </Button>
        </Card>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <Database size={20} />
          Usage Statistics
        </h2>

        <Card style={cardStyle}>
          <div style={usageItemStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ ...labelStyle, margin: '0' }}>Uploads Used</label>
              <span style={{ fontSize: '12px', color: '#6c5ce7', fontWeight: '500' }}>
                {usageStats.uploadsUsed} / {usageStats.uploadLimit}
              </span>
            </div>
            <div style={usageBarStyle}>
              <div
                style={usageFilledStyle(
                  (usageStats.uploadsUsed / usageStats.uploadLimit) * 100
                )}
              />
            </div>
          </div>

          <div style={usageItemStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ ...labelStyle, margin: '0' }}>Storage Used</label>
              <span style={{ fontSize: '12px', color: '#6c5ce7', fontWeight: '500' }}>
                {(usageStats.storageUsed / 1024 / 1024).toFixed(1)} MB /{' '}
                {(usageStats.storageLimit / 1024 / 1024).toFixed(0)} MB
              </span>
            </div>
            <div style={usageBarStyle}>
              <div
                style={usageFilledStyle(
                  (usageStats.storageUsed / usageStats.storageLimit) * 100
                )}
              />
            </div>
          </div>

          <div style={usageItemStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ ...labelStyle, margin: '0' }}>
                Generations Used
              </label>
              <span style={{ fontSize: '12px', color: '#6c5ce7', fontWeight: '500' }}>
                {usageStats.generationsUsed} / {usageStats.generationsLimit}
              </span>
            </div>
            <div style={usageBarStyle}>
              <div
                style={usageFilledStyle(
                  (usageStats.generationsUsed / usageStats.generationsLimit) * 100
                )}
              />
            </div>
          </div>
        </Card>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <Lock size={20} />
          Security
        </h2>

        <Card style={cardStyle}>
          {!showPasswordForm ? (
            <Button
              variant="secondary"
              onClick={() => setShowPasswordForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Lock size={16} />
              Change Password
            </Button>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Current Password</label>
                <div style={passwordInputWrapperStyle}>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    style={togglePasswordStyle}
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>New Password</label>
                <div style={passwordInputWrapperStyle}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new: e.target.value })
                    }
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    style={togglePasswordStyle}
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Confirm New Password</label>
                <div style={passwordInputWrapperStyle}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    style={togglePasswordStyle}
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div style={buttonGroupStyle}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={savingProfile}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <LogOut size={20} />
          Session
        </h2>

        <Card style={cardStyle}>
          <p
            style={{
              fontSize: '14px',
              color: '#a0a0b0',
              margin: '0 0 16px 0',
            }}
          >
            Sign out from all devices
          </p>
          <Button
            variant="secondary"
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </Card>
      </div>

      <div style={dangerZoneStyle}>
        <h2 style={dangerTitleStyle}>
          <AlertTriangle size={20} />
          Danger Zone
        </h2>
        <p style={dangerDescStyle}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Trash2 size={16} />
            Delete Account
          </Button>
        ) : (
          <div>
            <div
              style={{
                padding: '16px',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid #ff6b6b',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: '#ff6b6b',
                  fontWeight: '500',
                  marginBottom: '8px',
                }}
              >
                Are you sure? This cannot be undone.
              </div>
              <div style={{ fontSize: '13px', color: '#a0a0b0' }}>
                All your data including modules, files, flashcards, and study history will be permanently deleted.
              </div>
            </div>

            <div style={buttonGroupStyle}>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                loading={savingProfile}
              >
                Delete Everything
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
