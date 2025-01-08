import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  useTheme,
  Alert,
  Fade,
} from '@mui/material';
import { Person, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate loading for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (username === 'admin' && password === 'admin') {
      setError('');
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `url('./assets/abc123.jpg')`,
        backgroundSize: { xs: '200%', sm: 'cover' },
        backgroundPosition: { 
          xs: 'center 20%',
          sm: 'center' 
        },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }
      }}
    >
      {/* Loading Overlay */}
      <Fade in={isLoading}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url('./assets/abc123.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(rgba(255, 107, 0, 0.9), rgba(255, 215, 0, 0.9))',
              zIndex: 0,
            },
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src="./assets/AP_Logo.png"
              alt="Loading"
              sx={{
                width: 120,
                height: 120,
                animation: 'pulse 1.5s infinite',
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(0.95)',
                    opacity: 0.8,
                  },
                  '50%': {
                    transform: 'scale(1.05)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(0.95)',
                    opacity: 0.8,
                  },
                },
              }}
            />
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                animation: 'fadeInOut 2s infinite',
                '@keyframes fadeInOut': {
                  '0%': { opacity: 0.5 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.5 },
                },
              }}
            >
              Logging in...
            </Typography>
            <Box
              sx={{
                mt: 3,
                width: 200,
                height: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: '30%',
                  height: '100%',
                  bgcolor: 'white',
                  animation: 'loading 1.5s infinite',
                  '@keyframes loading': {
                    '0%': {
                      transform: 'translateX(-100%)',
                    },
                    '100%': {
                      transform: 'translateX(400%)',
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Fade>

      <Container 
        maxWidth={false}
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          px: { xs: 2, sm: 3 },
          maxWidth: { xs: '280px', sm: '450px' }
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: { xs: 1.5, sm: 4 },  // More padding on desktop
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            width: '100%'
          }}
        >
          <Box
            component="img"
            src="./assets/AP_Logo.png"
            alt="Government of Andhra Pradesh"
            sx={{
              width: { xs: 60, sm: 120 },  // Larger on desktop
              mb: { xs: 1, sm: 2 }
            }}
          />
          
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            align="center"
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 600,
              mb: { xs: 1, sm: 3 },
              fontSize: { xs: '1rem', sm: '1.5rem' }  // Larger on desktop
            }}
          >
            Government of Andhra Pradesh
          </Typography>
          
          <Typography
            variant="subtitle1"
            gutterBottom
            align="center"
            sx={{ 
              mb: { xs: 2, sm: 4 },
              fontSize: { xs: '0.75rem', sm: '1rem' }  // Larger on desktop
            }}
          >
            Stray Dog Population Management System
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: { xs: 1.5, sm: 3 },
                '& .MuiInputBase-root': {
                  height: { xs: '40px', sm: '56px' }  // Taller on desktop
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.8rem', sm: '1rem' }  // Larger on desktop
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.8rem', sm: '1rem' }  // Larger on desktop
                }
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: { xs: 2, sm: 4 },
                '& .MuiInputBase-root': {
                  height: { xs: '40px', sm: '56px' }  // Taller on desktop
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.8rem', sm: '1rem' }  // Larger on desktop
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.8rem', sm: '1rem' }  // Larger on desktop
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: { xs: 0.5, sm: 2 },
                mb: { xs: 1.5, sm: 3 },
                py: { xs: 0.75, sm: 1.5 },
                fontSize: { xs: '0.8rem', sm: '1.1rem' },  // Larger on desktop
                height: { xs: '36px', sm: '48px' },  // Taller on desktop
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: { xs: 1.5, sm: 2 },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
              }}
            >
              Login
            </Button>

            <Box sx={{ mt: { xs: 1, sm: 2 }, textAlign: 'center' }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}  // Larger on desktop
              >
                © {new Date().getFullYear()} Government of Andhra Pradesh. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 