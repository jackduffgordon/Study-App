import React from 'react';

export function TierBadge({ tier = 'free', size = 'sm' }) {
  const getTierStyles = () => {
    switch (tier.toLowerCase()) {
      case 'pro':
        return {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
          color: 'white',
          label: 'Pro',
        };
      case 'unlimited':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          color: 'white',
          label: 'Unlimited',
        };
      default:
        return {
          background: '#6b7280',
          color: 'white',
          label: 'Free',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'lg':
        return {
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '600',
        };
      case 'md':
        return {
          padding: '0.375rem 0.75rem',
          fontSize: '0.8125rem',
          fontWeight: '600',
        };
      case 'sm':
      default:
        return {
          padding: '0.25rem 0.625rem',
          fontSize: '0.75rem',
          fontWeight: '600',
        };
    }
  };

  const tierStyles = getTierStyles();
  const sizeStyles = getSizeStyles();

  return (
    <span
      style={{
        display: 'inline-block',
        background: tierStyles.background,
        color: tierStyles.color,
        borderRadius: '9999px',
        ...sizeStyles,
        whiteSpace: 'nowrap',
      }}
    >
      {tierStyles.label}
    </span>
  );
}

TierBadge.defaultProps = {
  tier: 'free',
  size: 'sm',
};
