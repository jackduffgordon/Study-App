import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0f0f13',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  };

  const mainContentStyle = {
    flex: 1,
    marginLeft: isMobile ? '80px' : '260px',
    transition: 'margin-left 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentAreaStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#0f0f13',
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <div style={contentAreaStyle}>
          <Outlet />
        </div>
      </div>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1a1a24',
            color: '#ffffff',
            border: '1px solid #252532',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            style: {
              borderColor: '#00d2d3',
            },
            iconTheme: {
              primary: '#00d2d3',
              secondary: '#0f0f13',
            },
          },
          error: {
            duration: 3000,
            style: {
              borderColor: '#ff6b6b',
            },
            iconTheme: {
              primary: '#ff6b6b',
              secondary: '#0f0f13',
            },
          },
        }}
      />
    </div>
  );
};

export default AppLayout;
