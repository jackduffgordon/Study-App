import React from 'react';

export function UsageBar({
  label,
  current,
  max,
  unit = '',
}) {
  const isUnlimited = max === Infinity;

  let percentage = 0;
  let barColor = '#10b981'; // green

  if (!isUnlimited && max > 0) {
    percentage = (current / max) * 100;

    if (percentage >= 80) {
      barColor = '#ef4444'; // red
    } else if (percentage >= 50) {
      barColor = '#eab308'; // yellow
    } else {
      barColor = '#10b981'; // green
    }
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const labelContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#e5e7eb',
  };

  const usageTextStyle = {
    fontSize: '0.8125rem',
    color: '#9ca3af',
  };

  const barBackgroundStyle = {
    width: '100%',
    height: '0.5rem',
    backgroundColor: '#374151',
    borderRadius: '9999px',
    overflow: 'hidden',
  };

  const barFillStyle = {
    height: '100%',
    width: isUnlimited ? '0%' : `${Math.min(percentage, 100)}%`,
    backgroundColor: barColor,
    transition: 'width 0.3s ease, background-color 0.3s ease',
  };

  const unlimitedTextStyle = {
    fontSize: '0.8125rem',
    color: '#a78bfa',
    fontWeight: '500',
  };

  return (
    <div style={containerStyle}>
      <div style={labelContainerStyle}>
        <span style={labelStyle}>{label}</span>
        {isUnlimited ? (
          <span style={unlimitedTextStyle}>Unlimited</span>
        ) : (
          <span style={usageTextStyle}>
            {current} / {max} {unit}
          </span>
        )}
      </div>
      {!isUnlimited && (
        <div style={barBackgroundStyle}>
          <div style={barFillStyle} />
        </div>
      )}
    </div>
  );
}

UsageBar.defaultProps = {
  unit: '',
};
