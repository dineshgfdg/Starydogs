import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import Dogs from './pages/Dogs';
import MapView from './pages/MapView';
import Targets from './pages/Targets';
import AchievedWithoutApp from './pages/AchievedWithoutApp';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CssBaseline />
                <Header onMenuToggle={handleMenuToggle} />
                <Sidebar open={isSidebarOpen} onClose={handleSidebarClose} />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    ml: { xs: isSidebarOpen ? '60px' : 0, sm: isSidebarOpen ? '240px' : 0 },
                    backgroundColor: '#f5f7fa',
                    minHeight: '100vh',
                    transition: 'margin 0.3s ease',
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/dogs" element={<Dogs />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/targets" element={<Targets />} />
                    <Route path="/achieved-without-app" element={<AchievedWithoutApp />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Box>
              </Box>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
