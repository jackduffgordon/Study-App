import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  };

  const sizeValue = sizeMap[size] || sizeMap.md;

  return (
    <div
      style={{
        display: 'inline-block',
        width: sizeValue,
        height: sizeValue,
        borderRadius: '50%',
        borderWidth: `${parseInt(sizeValue) / 8}px`,
        borderStyle: 'solid',
        borderColor: '#6c6c7c',
        borderTopColor: '#6c5ce7',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
