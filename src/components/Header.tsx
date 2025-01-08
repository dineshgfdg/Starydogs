import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  useTheme,
  IconButton,
  Button,
  Stack,
  useMediaQuery,
} from '@mui/material';
import {
  Logout,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Pets as PetsIcon,
  Map as MapIcon,
  ListAlt as ListAltIcon,
  AddTask as AddTaskIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        background: 'white',
        height: { xs: 'auto', sm: 80 }
      }}
    >
      <Toolbar 
        sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          p: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 0 },
          position: 'relative'
        }}
      >
        {/* Top Row */}
        <Box sx={{ 
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: 2,
          pr: { xs: 0, sm: '48px' }
        }}>
          <IconButton
            color="inherit"
            onClick={onMenuToggle}
            sx={{ color: '#FF6B00' }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box
              component="img"
              src="/assets/AP_Logo.png"
              alt="AP Logo"
              sx={{
                height: { xs: 35, sm: 50 }
              }}
            />
            <Box>
              <Typography 
                variant="h6"
                sx={{
                  color: '#FF6B00',
                  fontSize: { xs: '0.8rem', sm: '1.1rem' },
                  fontWeight: 600,
                  lineHeight: 1.2
                }}
              >
                Government of Andhra Pradesh
              </Typography>
              <Typography 
                variant="subtitle2"
                sx={{
                  color: '#FF6B00',
                  fontSize: { xs: '0.65rem', sm: '0.8rem' },
                  opacity: 0.9
                }}
              >
                Stray Dog Population Management System
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Logout Button - Absolute Position */}
        <IconButton 
          onClick={handleLogout}
          sx={{ 
            color: '#FF6B00',
            position: 'absolute',
            right: { xs: 8, sm: 16 },
            top: { xs: 8, sm: '50%' },
            transform: { sm: 'translateY(-50%)' }
          }}
        >
          <Logout />
        </IconButton>

        {/* Officials Section */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 4, sm: 6 },
          width: '100%',
          mt: { xs: 1, sm: 0 }
        }}>
          {/* CM Section */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box
              component="img"
              src="/assets/cm-sir.png"
              alt="Chief Minister"
              sx={{
                width: { xs: 40, sm: 60 },
                height: { xs: 40, sm: 60 },
                borderRadius: '50%',
                border: '2px solid #FF6B00',
                backgroundColor: '#FF6B00'
              }}
            />
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ 
                color: '#FF6B00', 
                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                fontWeight: 'bold',
                lineHeight: 1.2
              }}>
                SRI N. CHANDRABABU NAIDU
              </Typography>
              <Typography sx={{ 
                color: '#FF6B00', 
                fontSize: { xs: '0.55rem', sm: '0.65rem' },
                opacity: 0.9
              }}>
                HON'BLE CHIEF MINISTER
              </Typography>
            </Box>
          </Box>

          {/* Minister Section */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box
              component="img"
              src="/assets/narayana-sir.jpg"
              alt="Minister"
              sx={{
                width: { xs: 40, sm: 60 },
                height: { xs: 40, sm: 60 },
                borderRadius: '50%',
                border: '2px solid #FF6B00',
                backgroundColor: '#FF6B00'
              }}
            />
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ 
                color: '#FF6B00', 
                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                fontWeight: 'bold',
                lineHeight: 1.2
              }}>
                SRI P. NARAYANA
              </Typography>
              <Typography sx={{ 
                color: '#FF6B00', 
                fontSize: { xs: '0.55rem', sm: '0.65rem' },
                opacity: 0.9
              }}>
                HON'BLE MINISTER FOR MA & UD
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 