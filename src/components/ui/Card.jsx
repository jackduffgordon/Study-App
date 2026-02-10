import React from 'react';

const Card = ({ children, className = '', style = {}, onClick, hoverable = false }) => {
  const baseStyle = {
    backgroundColor: '#1a1a24',
    borderRadius: '12px',
    border: '1px solid #252532',
    padding: '24px',
    transition: 'all 0.3s ease',
    cursor: hoverable ? 'pointer' : 'auto',
    ...style,
  };

  const hoverableStyle = hoverable ? {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px rgba(108, 92, 231, 0.15)',
    },
  } : {};

  const handleMouseEnter = (e) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(108, 92, 231, 0.15)';
    }
  };

  const handleMouseLeave = (e) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <div
      style={baseStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default Card;
