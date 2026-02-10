import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModuleProvider } from './contexts/ModuleContext';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import UploadPage from './pages/UploadPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuestionsPage from './pages/QuestionsPage';
import EssaysPage from './pages/EssaysPage';
import FriendsPage from './pages/FriendsPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0f0f13',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            borderWidth: '4px',
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
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModuleProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="modules" element={<ModulesPage />} />
              <Route path="modules/:id" element={<ModuleDetailPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="flashcards" element={<FlashcardsPage />} />
              <Route path="questions" element={<QuestionsPage />} />
              <Route path="essays" element={<EssaysPage />} />
              <Route path="friends" element={<FriendsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
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
        </ModuleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
