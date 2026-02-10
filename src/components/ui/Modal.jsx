import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const getModalWidth = () => {
    switch (size) {
      case 'sm':
        return '28rem'; // 448px
      case 'lg':
        return '48rem'; // 768px
      case 'md':
      default:
        return '36rem'; // 576px
    }
  };

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    animation: 'fadeIn 0.2s ease-in-out',
  };

  const modalStyle = {
    backgroundColor: '#1f2937',
    borderRadius: '0.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: getModalWidth(),
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'fadeIn 0.2s ease-in-out',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #374151',
  };

  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#f3f4f6',
    margin: 0,
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '1.5rem',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    transition: 'color 0.2s ease',
  };

  const closeButtonHoverStyle = {
    color: '#f3f4f6',
  };

  const contentStyle = {
    padding: '1.5rem',
  };

  const [closeButtonHover, setCloseButtonHover] = React.useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <div style={backdropStyle} onClick={handleBackdropClick}>
        <div style={modalStyle}>
          <div style={headerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                ...closeButtonStyle,
                ...(closeButtonHover ? closeButtonHoverStyle : {}),
              }}
              onMouseEnter={() => setCloseButtonHover(true)}
              onMouseLeave={() => setCloseButtonHover(false)}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <div style={contentStyle}>{children}</div>
        </div>
      </div>
    </>
  );
}

Modal.defaultProps = {
  size: 'md',
};
