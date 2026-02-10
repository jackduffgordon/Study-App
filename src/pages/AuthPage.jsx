import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { user, error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName
        );

        if (error) {
          toast.error(error || 'Sign up failed');
        } else {
          toast.success('Account created! Please sign in.');
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
          });
          setIsSignUp(false);
        }
      } else {
        const { user, error } = await signIn(formData.email, formData.password);

        if (error) {
          toast.error(error || 'Sign in failed');
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    });
    setErrors({});
  };

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f13 0%, #1a1a24 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
    textAlign: 'center',
  };

  const logoStyle = {
    width: '48px',
    height: '48px',
    color: '#6c5ce7',
  };

  const headerStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0',
  };

  const taglineStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
    marginTop: '4px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '420px',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  };

  const inputStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    color: '#ffffff',
    transition: 'all 0.2s ease',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    outline: 'none',
  };

  const inputFocusStyle = {
    borderColor: '#6c5ce7',
    backgroundColor: '#252532',
    boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.1)',
  };

  const errorStyle = {
    fontSize: '12px',
    color: '#ff6b6b',
    marginTop: '4px',
  };

  const toggleContainerStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #252532',
    fontSize: '14px',
    color: '#a0a0b0',
    textAlign: 'center',
  };

  const toggleLinkStyle = {
    color: '#6c5ce7',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  };

  return (
    <div style={pageStyle}>
      <div style={logoContainerStyle}>
        <GraduationCap style={logoStyle} />
        <div>
          <h1 style={headerStyle}>StudyMate</h1>
          <p style={taglineStyle}>Your AI-Powered Study Companion</p>
        </div>
      </div>

      <Card style={cardStyle}>
        <form style={formStyle} onSubmit={handleSubmit}>
          <h2 style={{ ...headerStyle, fontSize: '24px', marginBottom: '8px' }}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          {isSignUp && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="John Doe"
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  Object.assign(e.target.style, {
                    borderColor: errors.fullName ? '#ff6b6b' : '#6c6c7c',
                  });
                }}
              />
              {errors.fullName && <span style={errorStyle}>{errors.fullName}</span>}
            </div>
          )}

          <div style={formGroupStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: errors.email ? '#ff6b6b' : '#6c6c7c',
              }}
              placeholder="you@example.com"
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => {
                Object.assign(e.target.style, {
                  borderColor: errors.email ? '#ff6b6b' : '#6c6c7c',
                });
              }}
            />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                borderColor: errors.password ? '#ff6b6b' : '#6c6c7c',
              }}
              placeholder="••••••••"
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => {
                Object.assign(e.target.style, {
                  borderColor: errors.password ? '#ff6b6b' : '#6c6c7c',
                });
              }}
            />
            {errors.password && <span style={errorStyle}>{errors.password}</span>}
          </div>

          {isSignUp && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={{
                  ...inputStyle,
                  borderColor: errors.confirmPassword ? '#ff6b6b' : '#6c6c7c',
                }}
                placeholder="••••••••"
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  Object.assign(e.target.style, {
                    borderColor: errors.confirmPassword ? '#ff6b6b' : '#6c6c7c',
                  });
                }}
              />
              {errors.confirmPassword && (
                <span style={errorStyle}>{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            style={{ marginTop: '12px' }}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          <div style={toggleContainerStyle}>
            <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
            <span
              style={toggleLinkStyle}
              onClick={toggleAuthMode}
              onMouseEnter={(e) => (e.target.style.color = '#7d6ff0')}
              onMouseLeave={(e) => (e.target.style.color = '#6c5ce7')}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AuthPage;
