import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  const variantStyles = {
    primary: {
      base: {
        backgroundColor: '#6c5ce7',
        color: '#ffffff',
        border: 'none',
      },
      hover: {
        backgroundColor: '#5a4dcf',
      },
      active: {
        backgroundColor: '#4a3db0',
      },
    },
    secondary: {
      base: {
        backgroundColor: '#252532',
        color: '#ffffff',
        border: '1px solid #6c6c7c',
      },
      hover: {
        backgroundColor: '#2f2f3c',
        borderColor: '#a0a0b0',
      },
      active: {
        backgroundColor: '#1a1a24',
      },
    },
    danger: {
      base: {
        backgroundColor: '#ff6b6b',
        color: '#ffffff',
        border: 'none',
      },
      hover: {
        backgroundColor: '#ff5252',
      },
      active: {
        backgroundColor: '#ee5a52',
      },
    },
    ghost: {
      base: {
        backgroundColor: 'transparent',
        color: '#6c5ce7',
        border: 'none',
      },
      hover: {
        color: '#7d6ff0',
      },
      active: {
        color: '#5a4dcf',
      },
    },
  };

  const sizeStyles = {
    sm: {
      padding: '6px 12px',
      fontSize: '14px',
      height: '32px',
    },
    md: {
      padding: '12px 24px',
      fontSize: '15px',
      height: '44px',
    },
    lg: {
      padding: '14px 32px',
      fontSize: '16px',
      height: '52px',
    },
  };

  const style = {
    ...variantStyles[variant].base,
    ...sizeStyles[size],
    width: fullWidth ? '100%' : 'auto',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  };

  const handleMouseEnter = (e) => {
    if (!disabled && !loading) {
      Object.assign(e.currentTarget.style, variantStyles[variant].hover);
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled && !loading) {
      Object.assign(e.currentTarget.style, variantStyles[variant].base);
    }
  };

  const handleMouseDown = (e) => {
    if (!disabled && !loading) {
      Object.assign(e.currentTarget.style, variantStyles[variant].active);
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled && !loading) {
      Object.assign(e.currentTarget.style, variantStyles[variant].hover);
    }
  };

  return (
    <button
      type={type}
      style={style}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
};

export default Button;
